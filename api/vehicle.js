export default async function handler(req, res) {
  // Enable CORS for browser testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { vehicle } = req.query;
  if (!vehicle) {
    return res.status(400).json({ 
      success: false,
      error: 'Missing vehicle parameter. Use ?vehicle=RC_NUMBER' 
    });
  }

  const originalUrl = `https://vercel-vehicle.vercel.app/api?vehicle=${encodeURIComponent(vehicle)}`;

  try {
    const response = await fetch(originalUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false,
        error: 'Upstream Provider Error',
        status: response.status 
      });
    }

    const data = await response.json();

    // --- FULL RE-BRANDING LOGIC ---
    // Purane handles ko delete karke naye handles set karna
    data.credit = "@Akash_Exploits_bot";
    data.developer = "@Akash_Exploits_bot";
    data.owner = "Akash_Exploits_bot";
    data.support = "https://t.me/Akash_Exploits_bot";
    
    // Agar response mein koi aur unwanted field hai toh usey bhi yahan modify kar sakte hain
    if (data.source) data.source = "TITAN HYPERION V6";

    res.status(200).json(data);
    
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      developer: "@Akash_Exploits_bot" 
    });
  }
}
