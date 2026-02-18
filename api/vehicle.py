export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { vehicle } = req.query;
  if (!vehicle) return res.status(400).json({ error: 'Missing vehicle' });

  const url = `https://vercel-vehicle.vercel.app/api?vehicle=${encodeURIComponent(vehicle)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.credit) data.credit = "@Akashishare";
    if (data.developer) data.developer = "@Akashishare";
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
