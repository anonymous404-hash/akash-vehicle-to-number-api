export default async function handler(req, res) {
  // Allow CORS (optional, but helps in testing)
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { vehicle } = req.query;
  if (!vehicle) {
    return res.status(400).json({ error: 'Missing vehicle parameter' });
  }

  const originalUrl = `https://vercel-vehicle.vercel.app/api?vehicle=${encodeURIComponent(vehicle)}`;

  try {
    const response = await fetch(originalUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Original API error' });
    }

    const data = await response.json();

    // Modify credit field (if present)
    if (data.credit) data.credit = "@Akashishare";
    if (data.developer) data.developer = "@Akashishare";

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
