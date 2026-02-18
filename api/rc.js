// api/rc.js – without Redis (only key validation)
import keysData from '../keys.json' assert { type: 'json' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { vehicle, key } = req.query;
  if (!vehicle) return res.status(400).json({ error: 'Missing vehicle parameter' });
  if (!key) return res.status(401).json({ error: 'Missing API key' });

  const keyInfo = keysData[key];
  if (!keyInfo) return res.status(401).json({ error: 'Invalid API key' });

  const now = new Date();
  const expiry = new Date(keyInfo.expiry);
  if (now > expiry) return res.status(401).json({ error: 'API key expired' });

  // ✅ Key valid – fetch original data
  try {
    const originalUrl = `https://vercel-vehicle.vercel.app/api?vehicle=${encodeURIComponent(vehicle)}`;
    const response = await fetch(originalUrl);
    if (!response.ok) throw new Error('Original API error');

    const data = await response.json();
    if (data.credit) data.credit = "@Akashishare";
    if (data.developer) data.developer = "@Akashishare";

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
