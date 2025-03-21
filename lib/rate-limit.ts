import type { NextRequest } from "next/server";

// Simple in-memory rate limiter
// For production, consider using a Redis-based solution
const ipRequests = new Map<string, { count: number; timestamp: number }>();

type RateLimitResponse = {
  success: boolean;
  headers: {
    "X-RateLimit-Limit": string;
    "X-RateLimit-Remaining": string;
    "X-RateLimit-Reset"?: string;
    "Retry-After"?: string;
  };
};

// Rate limit configuration
const RATE_LIMIT = 30; // requests
const TIME_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Function to clean up old entries
function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, data] of ipRequests.entries()) {
    if (now - data.timestamp > TIME_WINDOW * 2) {
      ipRequests.delete(ip);
    }
  }
}

// Instead of using setInterval, we'll clean up on each request
export async function rateLimit(
  request: NextRequest
): Promise<RateLimitResponse> {
  // Clean up old entries on each request
  cleanupOldEntries();

  // Get IP from request headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = (forwarded ? forwarded.split(",")[0].trim() : realIp) || "unknown";

  // Get current timestamp
  const now = Date.now();

  // Get current request count for this IP
  const ipData = ipRequests.get(ip) || { count: 0, timestamp: now };

  // Check if the time window has passed since the last request
  if (now - ipData.timestamp > TIME_WINDOW) {
    // Reset counter if time window has passed
    ipData.count = 0;
    ipData.timestamp = now;
  }

  // Increment request count
  ipData.count += 1;

  // Store updated data
  ipRequests.set(ip, ipData);

  // Calculate time until rate limit resets
  const resetTime = Math.ceil((ipData.timestamp + TIME_WINDOW - now) / 1000);

  // Calculate remaining requests
  const remainingRequests = Math.max(0, RATE_LIMIT - ipData.count);

  // Common headers
  const rateHeaders = {
    "X-RateLimit-Limit": RATE_LIMIT.toString(),
    "X-RateLimit-Remaining": remainingRequests.toString(),
  };

  // Check if rate limit has been exceeded
  if (ipData.count > RATE_LIMIT) {
    return {
      success: false,
      headers: {
        ...rateHeaders,
        "X-RateLimit-Reset": resetTime.toString(),
        "Retry-After": resetTime.toString(),
      },
    };
  }

  return {
    success: true,
    headers: rateHeaders,
  };
}
