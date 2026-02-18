// api/rc.js – API key validation with expiry only
import keysData from '../keys.json' assert { type: 'json' };

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 1️⃣ Get vehicle number and API key from query
  const { vehicle, key } = req.query;
  if (!vehicle) {
    return res.status(400).json({ error: 'Missing vehicle parameter' });
  }
  if (!key) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  // 2️⃣ Check if key exists in keys.json
  const expiryStr = keysData[key];
  if (!expiryStr) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // 3️⃣ Check expiry
  const now = new Date();
  const expiry = new Date(expiryStr);
  if (now > expiry) {
    return res.status(401).json({ error: 'API key expired' });
  }

  // 4️⃣ Key is valid – fetch original RC data
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
