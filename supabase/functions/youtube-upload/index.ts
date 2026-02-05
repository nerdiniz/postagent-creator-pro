import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Initialize Supabase Client with Service Role
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Authenticate User
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
        if (authError || !user) {
            console.error('Auth check failed:', authError?.message)
            throw new Error('Unauthorized')
        }

        // 3. Parse Request
        const reqClone = req.clone()
        const contentType = req.headers.get('content-type') || ''
        console.log('Request Content-Type:', contentType)

        let action = 'upload'
        let bodyData: any = {}
        let formData: FormData | null = null

        if (contentType.includes('application/json')) {
            try {
                bodyData = await req.json()
                action = bodyData.action || 'upload'
            } catch (e) {
                console.error('JSON Parse Error:', e)
                throw new Error('Invalid JSON body')
            }
        } else if (contentType.includes('multipart/form-data')) {
            try {
                formData = await reqClone.formData()
                action = formData.get('action') as string || 'upload'
            } catch (e) {
                console.error('FormData Parse Error:', e)
                throw new Error('Invalid FormData body')
            }
        }

        // 4. Get Google Credentials from Secrets
        const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = Deno.env.toObject()

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            console.error('Environment variables missing: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET')
            throw new Error('Server configuration error: Google credentials missing.')
        }

        // --- Action: Exchange Authorization Code for Tokens ---
        if (action === 'exchange-code') {
            const { code, redirectUri } = bodyData
            if (!code) throw new Error('Authorization code missing in request')

            console.log('Exchanging code for tokens...')
            const finalRedirectUri = redirectUri || GOOGLE_REDIRECT_URI

            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    redirect_uri: finalRedirectUri,
                    grant_type: 'authorization_code',
                }),
            })

            const tokens = await tokenRes.json()
            if (!tokenRes.ok) {
                console.error('Google Token Exchange Error:', tokens)
                throw new Error(`Google exchange failed: ${tokens.error_description || tokens.error}`)
            }

            // Fetch actual channel details to store ID, Avatar and Handle
            const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            })
            const channelData = await channelRes.json()
            const channelInfo = channelData.items?.[0] || {}

            return new Response(JSON.stringify({
                ...tokens,
                channelDetails: {
                    id: channelInfo.id,
                    title: channelInfo.snippet?.title,
                    handle: channelInfo.snippet?.customUrl,
                    avatarUrl: channelInfo.snippet?.thumbnails?.default?.url
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (action === 'get-channel-stats') {
            const { channelId } = bodyData
            if (!channelId) throw new Error('Missing channelId')

            const { data: channelData, error: channelError } = await supabaseClient
                .from('channels')
                .select('*')
                .eq('id', channelId)
                .single()

            if (channelError || !channelData) {
                console.error('Channel error:', channelError)
                throw new Error('Channel not found or unauthorized')
            }

            let credentials = channelData.youtube_credentials || {}
            let accessToken = credentials.access_token
            let targetId = channelData.youtube_channel_id

            // Refresh token logic
            if (credentials.refresh_token) {
                const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: GOOGLE_CLIENT_ID,
                        client_secret: GOOGLE_CLIENT_SECRET,
                        refresh_token: credentials.refresh_token,
                        grant_type: 'refresh_token',
                    }),
                })
                const refreshData = await refreshRes.json()
                if (refreshRes.ok) {
                    accessToken = refreshData.access_token
                    await supabaseClient.from('channels').update({
                        youtube_credentials: { ...credentials, access_token: accessToken }
                    }).eq('id', channelId)
                }
            }

            if (!accessToken) throw new Error('Could not obtain valid access token')

            // Discover targetId if missing
            if (!targetId) {
                console.log('Discovering YouTube Channel ID for record:', channelId)
                const discoverRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
                const discoverData = await discoverRes.json()
                const item = discoverData.items?.[0]
                if (item) {
                    targetId = item.id
                    await supabaseClient.from('channels').update({
                        youtube_channel_id: item.id,
                        avatar_url: item.snippet?.thumbnails?.default?.url,
                        handle: item.snippet?.customUrl,
                        statistics: item.statistics
                    }).eq('id', channelId)

                    return new Response(JSON.stringify({ success: true, statistics: item.statistics }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                } else {
                    throw new Error('Could not find YouTube channel associated with these credentials')
                }
            }

            const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${targetId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })

            const statsData = await statsRes.json()
            if (!statsRes.ok) {
                console.error('YouTube API Stats Error:', statsData)
                throw new Error('YouTube API failed to return statistics')
            }

            const statistics = statsData.items?.[0]?.statistics
            if (statistics) {
                await supabaseClient.from('channels').update({ statistics }).eq('id', channelId)
            }

            return new Response(JSON.stringify({ success: true, statistics }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (action === 'delete-video') {
            const { videoId, channelId } = bodyData
            if (!videoId || !channelId) throw new Error('Missing videoId or channelId')

            const { data: channelData } = await supabaseClient
                .from('channels')
                .select('youtube_credentials')
                .eq('id', channelId)
                .single()

            if (!channelData) throw new Error('Channel not found')

            let accessToken = channelData.youtube_credentials?.access_token

            if (channelData.youtube_credentials?.refresh_token) {
                const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: GOOGLE_CLIENT_ID,
                        client_secret: GOOGLE_CLIENT_SECRET,
                        refresh_token: channelData.youtube_credentials.refresh_token,
                        grant_type: 'refresh_token',
                    }),
                })
                const rd = await refreshRes.json()
                if (refreshRes.ok) {
                    accessToken = rd.access_token
                    await supabaseClient.from('channels').update({
                        youtube_credentials: { ...channelData.youtube_credentials, access_token: accessToken }
                    }).eq('id', channelId)
                }
            }

            const delRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })

            if (!delRes.ok && delRes.status !== 404) {
                throw new Error(`YouTube Delete Failed: ${await delRes.text()}`)
            }

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // --- Action: Upload Video to YouTube ---
        if (action === 'upload') {
            if (!formData) throw new Error('Form data required for upload')

            const videoFile = formData.get('video') as File
            const title = formData.get('title') as string
            const description = formData.get('description') as string
            const tags = formData.get('tags') as string
            const privacyStatus = formData.get('privacyStatus') as string || 'private'
            const channelId = formData.get('channelId') as string

            if (!videoFile || !title || !channelId) throw new Error('Missing upload parameters')

            const { data: channelData } = await supabaseClient
                .from('channels')
                .select('youtube_credentials')
                .eq('id', channelId)
                .single()

            if (!channelData) throw new Error('Channel credentials not found')

            let accessToken = channelData.youtube_credentials?.access_token

            if (channelData.youtube_credentials?.refresh_token) {
                const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: GOOGLE_CLIENT_ID,
                        client_secret: GOOGLE_CLIENT_SECRET,
                        refresh_token: channelData.youtube_credentials.refresh_token,
                        grant_type: 'refresh_token',
                    }),
                })
                const refreshData = await refreshRes.json()
                if (refreshRes.ok) {
                    accessToken = refreshData.access_token
                    await supabaseClient.from('channels').update({
                        youtube_credentials: { ...channelData.youtube_credentials, access_token: accessToken }
                    }).eq('id', channelId)
                }
            }

            if (!accessToken) throw new Error('No valid token')

            const scheduledAt = formData.get('scheduledAt') as string
            const status: any = { privacyStatus, selfDeclaredMadeForKids: false }
            if (scheduledAt) status.publishAt = scheduledAt

            const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'X-Upload-Content-Length': videoFile.size.toString(),
                    'X-Upload-Content-Type': videoFile.type
                },
                body: JSON.stringify({
                    snippet: {
                        title,
                        description,
                        categoryId: '22',
                        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
                    },
                    status: status
                })
            })

            if (!initRes.ok) throw new Error(`YouTube API Init Failed: ${await initRes.text()}`)

            const uploadUrl = initRes.headers.get('Location')
            if (!uploadUrl) throw new Error('Upload URL discovery failed')

            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Length': videoFile.size.toString() },
                body: videoFile
            })

            return new Response(JSON.stringify({ success: true, data: await uploadRes.json() }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

    } catch (error: any) {
        console.error('Edge Function Error:', error.message)
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            details: error.stack
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
