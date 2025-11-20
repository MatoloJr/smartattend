import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side API route to get client IP address
 * This avoids client-side external API calls that can trigger Vercel security checkpoints
 */
export async function GET(request: NextRequest) {
  try {
    // Get IP from Vercel headers (preferred method)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
    
    // Priority: Cloudflare > X-Real-IP > X-Forwarded-For (first IP)
    const ip = cfConnectingIp || 
               realIp || 
               (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
               request.ip ||
               'unknown';
    
    return NextResponse.json({ ip });
  } catch (error) {
    console.error('Error getting IP:', error);
    return NextResponse.json({ ip: 'unknown' }, { status: 200 });
  }
}

