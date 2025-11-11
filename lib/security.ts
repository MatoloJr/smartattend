/**
 * Security utilities for SmartAttend
 * Includes device fingerprinting, rate limiting, and anomaly detection
 */

interface DeviceFingerprint {
  id: string;
  ipAddress: string;
  timezone: string;
  userAgent: string;
  screenResolution: string;
  language: string;
  platform: string;
  timestamp: number;
}

interface AttendanceAttempt {
  studentId: string;
  sessionId: string;
  deviceFingerprint: string;
  timestamp: number;
  ipAddress: string;
  nonce: string;
}

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  waitTime?: number;
}

// In-memory storage (in production, use database)
const deviceSubmissions = new Map<string, Set<string>>(); // sessionId -> Set of device fingerprints
const attemptHistory = new Map<string, AttendanceAttempt[]>(); // studentId -> attempts
const nonceUsage = new Map<string, Set<string>>(); // nonce -> Set of device fingerprints

/**
 * Generate a unique device fingerprint
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  // Get IP address (in production, use server-side API)
  const ipAddress = await getClientIP();
  
  // Collect device information
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userAgent = navigator.userAgent;
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language;
  const platform = navigator.platform;
  
  // Create fingerprint hash
  const fingerprintData = `${ipAddress}|${timezone}|${userAgent}|${screenResolution}|${language}|${platform}`;
  const fingerprintHash = await hashString(fingerprintData);
  
  return {
    id: fingerprintHash,
    ipAddress,
    timezone,
    userAgent,
    screenResolution,
    language,
    platform,
    timestamp: Date.now()
  };
}

/**
 * Get client IP address (simplified - in production use server-side)
 */
async function getClientIP(): Promise<string> {
  try {
    // In production, call your backend API to get real IP
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP:', error);
    return 'unknown';
  }
}

/**
 * Hash a string using SHA-256
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify QR code hasn't expired
 */
export function verifyQRExpiry(expiry: number): boolean {
  return Date.now() < expiry;
}

/**
 * Check if nonce has been used by this device
 */
export function checkNonceReuse(nonce: string, deviceId: string): boolean {
  if (!nonceUsage.has(nonce)) {
    nonceUsage.set(nonce, new Set());
  }
  
  const usedDevices = nonceUsage.get(nonce)!;
  
  if (usedDevices.has(deviceId)) {
    return true; // Nonce already used by this device
  }
  
  usedDevices.add(deviceId);
  return false;
}

/**
 * Check if device has already submitted for this session
 */
export function checkDeviceSubmission(sessionId: string, deviceId: string): boolean {
  if (!deviceSubmissions.has(sessionId)) {
    deviceSubmissions.set(sessionId, new Set());
  }
  
  const sessionDevices = deviceSubmissions.get(sessionId)!;
  
  if (sessionDevices.has(deviceId)) {
    return true; // Device already submitted
  }
  
  sessionDevices.add(deviceId);
  return false;
}

/**
 * Rate limiting and anomaly detection
 */
export function checkRateLimit(
  studentId: string,
  sessionId: string,
  deviceFingerprint: string,
  nonce: string
): RateLimitResult {
  const now = Date.now();
  
  // Get student's attempt history
  if (!attemptHistory.has(studentId)) {
    attemptHistory.set(studentId, []);
  }
  
  const attempts = attemptHistory.get(studentId)!;
  
  // Remove old attempts (older than 1 hour)
  const recentAttempts = attempts.filter(a => now - a.timestamp < 3600000);
  attemptHistory.set(studentId, recentAttempts);
  
  // Check for rapid sequential scans (more than 3 in 10 seconds)
  const veryRecentAttempts = recentAttempts.filter(a => now - a.timestamp < 10000);
  if (veryRecentAttempts.length >= 3) {
    return {
      allowed: false,
      reason: 'Too many rapid attempts detected. Please wait.',
      waitTime: 10
    };
  }
  
  // Check for multiple attempts in short time (more than 5 in 1 minute)
  const minuteAttempts = recentAttempts.filter(a => now - a.timestamp < 60000);
  if (minuteAttempts.length >= 5) {
    return {
      allowed: false,
      reason: 'Rate limit exceeded. Please wait before trying again.',
      waitTime: 60
    };
  }
  
  // Check for suspicious pattern: same session, different devices
  const sessionAttempts = recentAttempts.filter(a => a.sessionId === sessionId);
  const uniqueDevices = new Set(sessionAttempts.map(a => a.deviceFingerprint));
  if (uniqueDevices.size > 2) {
    return {
      allowed: false,
      reason: 'Multiple devices detected. Flagged for review.',
      waitTime: 300
    };
  }
  
  // Check for nonce reuse
  if (checkNonceReuse(nonce, deviceFingerprint)) {
    return {
      allowed: false,
      reason: 'QR code already used. Request new code from lecturer.',
      waitTime: 0
    };
  }
  
  // Check for device resubmission
  if (checkDeviceSubmission(sessionId, deviceFingerprint)) {
    return {
      allowed: false,
      reason: 'Attendance already submitted from this device.',
      waitTime: 0
    };
  }
  
  // Record this attempt
  const attempt: AttendanceAttempt = {
    studentId,
    sessionId,
    deviceFingerprint,
    timestamp: now,
    ipAddress: 'pending', // Will be filled by actual IP
    nonce
  };
  
  recentAttempts.push(attempt);
  attemptHistory.set(studentId, recentAttempts);
  
  return {
    allowed: true
  };
}

/**
 * Verify watermark integrity
 */
export function verifyWatermark(
  sessionId: string,
  nonce: string,
  providedWatermark: string
): boolean {
  // Recreate watermark and compare
  const data = `${sessionId}-${nonce}-`;
  const expectedPrefix = btoa(data).substring(0, 8);
  
  return providedWatermark.startsWith(expectedPrefix);
}

/**
 * Flag suspicious activity for human audit
 */
export interface SuspiciousActivity {
  studentId: string;
  sessionId: string;
  reason: string;
  timestamp: number;
  deviceFingerprint: string;
  severity: 'low' | 'medium' | 'high';
}

const suspiciousActivities: SuspiciousActivity[] = [];

export function flagSuspiciousActivity(activity: SuspiciousActivity): void {
  suspiciousActivities.push(activity);
  
  // In production, send to backend for logging
  console.warn('Suspicious activity detected:', activity);
  
  // Could trigger notifications for admins
  if (activity.severity === 'high') {
    // Send immediate alert
    console.error('HIGH SEVERITY: Immediate review required', activity);
  }
}

export function getSuspiciousActivities(
  filters?: {
    studentId?: string;
    sessionId?: string;
    severity?: 'low' | 'medium' | 'high';
    since?: number;
  }
): SuspiciousActivity[] {
  let filtered = [...suspiciousActivities];
  
  if (filters?.studentId) {
    filtered = filtered.filter(a => a.studentId === filters.studentId);
  }
  
  if (filters?.sessionId) {
    filtered = filtered.filter(a => a.sessionId === filters.sessionId);
  }
  
  if (filters?.severity) {
    filtered = filtered.filter(a => a.severity === filters.severity);
  }
  
  if (filters?.since) {
    filtered = filtered.filter(a => a.timestamp >= filters.since!);
  }
  
  return filtered;
}

/**
 * Clear session data (call when session ends)
 */
export function clearSessionData(sessionId: string): void {
  deviceSubmissions.delete(sessionId);
  
  // Clear nonces for this session
  for (const [nonce, devices] of Array.from(nonceUsage.entries())) {
    if (nonce.startsWith(sessionId)) {
      nonceUsage.delete(nonce);
    }
  }
}

/**
 * Get network timing for additional fingerprinting
 */
export async function getNetworkTiming(): Promise<{
  rtt: number;
  downlink: number;
  effectiveType: string;
}> {
  // @ts-ignore - NetworkInformation API
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    return {
      rtt: connection.rtt || 0,
      downlink: connection.downlink || 0,
      effectiveType: connection.effectiveType || 'unknown'
    };
  }
  
  return {
    rtt: 0,
    downlink: 0,
    effectiveType: 'unknown'
  };
}
