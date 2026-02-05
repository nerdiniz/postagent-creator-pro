import { supabase } from './supabase';
const GOOGLE_CLIENT_ID = '1007452758122-2p1ajt0vhp6n0s01cq29u0lj2dfuthpv.apps.googleusercontent.com';

export interface YouTubeUploadParams {
    title: string;
    description: string;
    tags?: string[];
    privacyStatus: 'public' | 'private' | 'unlisted';
    videoFile: File | Blob;
    scheduledAt?: string;
    type: 'short' | 'video';
}

export const youtubeApi = {
    getAuthUrl: () => {
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: window.location.origin,
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
            access_type: 'offline',
            prompt: 'consent',
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    },

    async exchangeCode(code: string, redirectUri: string) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const { data, error } = await supabase.functions.invoke('youtube-upload', {
            body: { action: 'exchange-code', code, redirectUri },
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (error) throw error;
        return data;
    },
    /**
     * Uploads a short using the Supabase Edge Function.
     */
    async uploadShort(params: YouTubeUploadParams & { channelId: string; recordId: string }) {
        console.log('Sending upload request to Supabase Edge Function:', params.title);

        const formData = new FormData();
        formData.append('video', params.videoFile);
        formData.append('title', params.title);
        formData.append('description', params.description);
        formData.append('privacyStatus', params.privacyStatus);
        if (params.tags) {
            formData.append('tags', params.tags.join(','));
        }
        formData.append('channelId', params.channelId);
        if (params.scheduledAt) {
            formData.append('scheduledAt', params.scheduledAt);
        }

        const { data, error } = await supabase.functions.invoke('youtube-upload', {
            body: formData,
        });

        if (error) {
            console.error('Edge Function Error:', error);
            throw error;
        }

        // Save YT Video ID to the database
        if (data?.data?.id) {
            const tableName = params.type === 'short' ? 'shorts' : 'videos';
            await supabase
                .from(tableName)
                .update({ yt_video_id: data.data.id, status: 'posted' })
                .eq('id', params.recordId);
        }

        return data;
    },

    async deleteVideo(videoId: string, channelId: string) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const { data, error } = await supabase.functions.invoke('youtube-upload', {
            body: { action: 'delete-video', videoId, channelId },
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (error) throw error;
        return data;
    },

    async getChannelStats(channelId: string) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const { data, error } = await supabase.functions.invoke('youtube-upload', {
            body: { action: 'get-channel-stats', channelId },
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (error) throw error;
        return data;
    },

    /**
     * Check remaining quota if possible via API or mock tracking.
     */
    async getQuotaStatus() {
        // This could also be an Edge Function call to fetch real quota
        return {
            used: 4200,
            total: 10000
        };
    }
};
