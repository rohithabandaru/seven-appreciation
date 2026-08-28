/**
 * Security event logger.
 *
 * Logs to console in production (can be forwarded to log aggregation).
 * In dev, logs with structured format for debugging.
 *
 * Does NOT log: passwords, tokens, secrets, full request bodies.
 */

export type SecurityEvent =
  | 'rate_limit_hit'
  | 'failed_login'
  | 'successful_login'
  | 'registration_attempt'
  | 'registration_blocked'
  | 'report_submitted'
  | 'report_duplicate_blocked'
  | 'moderation_blocked'
  | 'moderation_unknown_type'
  | 'moderation_content_update_failed'
  | 'admin_action'
  | 'post_moderation'
  | 'admin_auth_failed'
  | 'ip_banned'
  | 'ip_unbanned'
  | 'oauth_login_banned'
  | 'payload_too_large'
  | 'unauthorized_access_attempt'
  | 'upload_validation_failed'
  | 'upload_processing_failed'
  | 'upload_storage_failed'
  | 'upload_db_failed'
  | 'upload_invalid_url'
  | 'upload_base64_rejected'
  | 'upload_unauthorized_delete'
  | 'upload_storage_delete_failed';

interface SecurityLogEntry {
  timestamp?: string;
  event: SecurityEvent;
  ip?: string;
  userId?: string;
  email?: string;
  detail?: string;
  endpoint?: string;
}

export function logSecurityEvent(entry: SecurityLogEntry): void {
  const logEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // In production, this could be forwarded to a log aggregation service.
  // Console output is safe — no secrets are included.
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({ security: logEntry }));
  } else {
    console.log('[SECURITY]', logEntry.event, logEntry.detail || '');
  }
}
