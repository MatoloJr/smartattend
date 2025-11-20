/**
 * Utility functions for API calls
 * Includes handling for Vercel security checkpoint responses
 */

/**
 * Check if a response is a Vercel security checkpoint page
 */
export function isVercelSecurityCheckpoint(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  return contentType?.includes('text/html') === true;
}

/**
 * Enhanced fetch wrapper that handles Vercel security checkpoints
 * and provides better error messages
 */
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Check if we got a security checkpoint page instead of expected response
    if (isVercelSecurityCheckpoint(response)) {
      // Clone the response to read it without consuming the original
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      
      if (text.includes('Vercel Security Checkpoint') || text.includes('vercel.link/security-checkpoint')) {
        throw new Error(
          'Vercel security checkpoint detected. This may be due to rate limiting or suspicious activity. ' +
          'Please wait a moment and try again, or contact support if the issue persists.'
        );
      }
    }
    
    return response;
  } catch (error) {
    // Re-throw with more context if it's our custom error
    if (error instanceof Error && error.message.includes('Vercel security checkpoint')) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach the server. Please check your connection.');
    }
    
    throw error;
  }
}

/**
 * Parse JSON response with better error handling
 */
export async function parseJSONResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    
    // Check for Vercel security checkpoint
    if (text.includes('Vercel Security Checkpoint')) {
      throw new Error(
        'Vercel security checkpoint detected. Please wait a moment and try again.'
      );
    }
    
    throw new Error(
      `Expected JSON response but got ${contentType}. Response: ${text.substring(0, 200)}`
    );
  }
  
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

