import { supabase } from './supabase';

/**
 * System Logger utility for monitoring system interaction and data traffic.
 */
export const logger = {
    /**
     * Logs an event to the system_logs table.
     * @param event The name of the event (e.g., 'video_upload', 'error_occurred')
     * @param details Additional data to store with the log
     */
    async log(event: string, details: Record<string, any> = {}) {
        try {
            // We don't need to pass user_id explicitly if using RLS and default auth.uid()
            // but let's be explicit if possible to ensure context.
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.warn('Logging attempted without active session:', event);
                // Fallback to console for unauthenticated logs
                console.log(`[LOG - GUEST] ${event}:`, details);
                return;
            }

            console.log(`[LOG - ${user.email}] ${event}:`, details);

            const { error } = await supabase.from('system_logs').insert({
                user_id: user.id,
                event,
                details,
                created_at: new Date().toISOString()
            });

            if (error) {
                console.error('Failed to save log to database:', error);
            }
        } catch (err) {
            console.error('Critical error in logging utility:', err);
        }
    },

    /**
     * Helper to log errors specifically.
     */
    async error(message: string, error: any) {
        return this.log('error', {
            message,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    },

    /**
     * Helper to log traffic/API requests.
     */
    async traffic(direction: 'in' | 'out', service: string, data: any) {
        return this.log('traffic', {
            direction,
            service,
            data
        });
    },

    /**
     * Helper to log info messages.
     */
    async info(message: string, details: Record<string, any> = {}) {
        return this.log('info', { message, ...details });
    }
};
