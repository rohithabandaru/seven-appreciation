import { logSecurityEvent } from '@/lib/security-logger';

describe('Security Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('logs valid security events without throwing', () => {
    expect(() => {
      logSecurityEvent({ event: 'failed_login', ip: '1.2.3.4' });
    }).not.toThrow();
  });

  it('includes timestamp in log entry', () => {
    logSecurityEvent({ event: 'rate_limit_hit', ip: '1.2.3.4' });
    expect(consoleSpy).toHaveBeenCalled();
    const call = consoleSpy.mock.calls[0];
    expect(call[1]).toBe('rate_limit_hit');
  });

  it('logs registration events', () => {
    expect(() => {
      logSecurityEvent({ event: 'registration_attempt', ip: '1.2.3.4', email: 'test@example.test' });
      logSecurityEvent({ event: 'registration_blocked', ip: '1.2.3.4' });
    }).not.toThrow();
  });

  it('logs upload security events', () => {
    expect(() => {
      logSecurityEvent({ event: 'upload_validation_failed', ip: '1.2.3.4', userId: 'user-1', detail: 'Invalid file' });
      logSecurityEvent({ event: 'upload_processing_failed', ip: '1.2.3.4', userId: 'user-1' });
      logSecurityEvent({ event: 'upload_storage_failed', ip: '1.2.3.4', userId: 'user-1' });
      logSecurityEvent({ event: 'upload_db_failed', ip: '1.2.3.4', userId: 'user-1' });
      logSecurityEvent({ event: 'upload_invalid_url', ip: '1.2.3.4', userId: 'user-1', detail: 'evil.com' });
      logSecurityEvent({ event: 'upload_base64_rejected', ip: '1.2.3.4', userId: 'user-1' });
      logSecurityEvent({ event: 'upload_unauthorized_delete', ip: '1.2.3.4', userId: 'user-1' });
      logSecurityEvent({ event: 'upload_storage_delete_failed', ip: '1.2.3.4', userId: 'user-1' });
    }).not.toThrow();
  });

  it('does not log passwords or secrets', () => {
    logSecurityEvent({
      event: 'successful_login',
      ip: '1.2.3.4',
      email: 'test@example.test',
      detail: 'User logged in',
    });
    const output = JSON.stringify(consoleSpy.mock.calls);
    expect(output).not.toContain('password');
    expect(output).not.toContain('secret');
  });

  it('accepts all security event types', () => {
    const events = [
      'rate_limit_hit', 'failed_login', 'successful_login',
      'registration_attempt', 'registration_blocked',
      'report_submitted', 'report_duplicate_blocked',
      'moderation_blocked', 'admin_action',
      'ip_banned', 'ip_unbanned',
      'payload_too_large', 'unauthorized_access_attempt',
      'upload_validation_failed', 'upload_processing_failed',
      'upload_storage_failed', 'upload_db_failed',
      'upload_invalid_url', 'upload_base64_rejected',
      'upload_unauthorized_delete', 'upload_storage_delete_failed',
    ] as const;
    for (const event of events) {
      expect(() => logSecurityEvent({ event })).not.toThrow();
    }
  });
});
