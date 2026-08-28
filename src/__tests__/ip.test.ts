import { getClientIp } from '@/lib/ip';

describe('IP Extraction', () => {
  function makeRequest(headers: Record<string, string>): Request {
    return new Request('http://localhost', { headers });
  }

  it('extracts IP from x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('extracts IP from x-real-ip', () => {
    const req = makeRequest({ 'x-real-ip': '9.8.7.6' });
    expect(getClientIp(req)).toBe('9.8.7.6');
  });

  it('returns unknown when no headers present', () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe('unknown');
  });

  it('prefers x-forwarded-for over x-real-ip', () => {
    const req = makeRequest({
      'x-forwarded-for': '1.1.1.1',
      'x-real-ip': '2.2.2.2',
    });
    expect(getClientIp(req)).toBe('1.1.1.1');
  });

  it('takes first IP from x-forwarded-for chain', () => {
    const req = makeRequest({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2, 10.0.0.3' });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('handles single IP in x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '192.168.1.1' });
    expect(getClientIp(req)).toBe('192.168.1.1');
  });

  it('trims whitespace from IP', () => {
    const req = makeRequest({ 'x-forwarded-for': '  1.2.3.4  , 5.6.7.8' });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('prefers x-real-ip when TRUSTED_PROXY is true', () => {
    const original = process.env.TRUSTED_PROXY;
    process.env.TRUSTED_PROXY = 'true';
    try {
      const req = makeRequest({
        'x-real-ip': '100.100.100.100',
        'x-forwarded-for': '1.1.1.1',
      });
      expect(getClientIp(req)).toBe('100.100.100.100');
    } finally {
      process.env.TRUSTED_PROXY = original;
    }
  });
});
