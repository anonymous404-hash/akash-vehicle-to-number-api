// api/rc.js – Vercel serverless function with key auth, expiry, and daily limits
import { Redis } from '@upstash/redis';
import keysData from '../keys.json' assert { type: 'json' };

// Initialize Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // Enable CORS for browser testing
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 1️⃣ Get parameters
  const { vehicle, key } = req.query;
  if (!vehicle) {
    return res.status(400).json({ error: 'Missing vehicle parameter' });
  }
  if (!key) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  // 2️⃣ Validate key existence and expiry
  const keyInfo = keysData[key];
  if (!keyInfo) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  const now = new Date();
  const expiry = new Date(keyInfo.expiry);
  if (now > expiry) {
    return res.status(401).json({ error: 'API key expired' });
  }

  // 3️⃣ Daily rate limiting using Redis
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const rateKey = `rate:${key}:${today}`;

  // Increment and get current count
  const current = await redis.incr(rateKey);
  if (current === 1) {
    // First request today – set expiry to end of day (in seconds)
    const secondsUntilEndOfDay = Math.floor(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() / 1000 - now.getTime() / 1000
    );
    await redis.expire(rateKey, secondsUntilEndOfDay);
  }

  if (current > keyInfo.dailyLimit) {
    return res.status(429).json({ error: 'Daily search limit exceeded' });
  }

  // 4️⃣ Fetch original RC data
  try {
    const originalUrl = `https://vercel-vehicle.vercel.app/api?vehicle=${encodeURIComponent(vehicle)}`;
    const response = await fetch(originalUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Original API error' });
    }

    const data = await response.json();

    // 5️⃣ Replace credit/developer fields
    if (data.credit) data.credit = "@Akashishare";
    if (data.developer) data.developer = "@Akashishare";

    // 6️⃣ Return modified response
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
