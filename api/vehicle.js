const express = require('express');
const axios = require('axios');
const app = express();

// 🔁 Recursive function to replace all branding fields with your name
function replaceBranding(obj, yourName = '@Akash_Exploits_bot') {
    // Agar object nahi hai to wapas bhejo
    if (!obj || typeof obj !== 'object') return obj;

    // Agar array hai to har item par recursion
    if (Array.isArray(obj)) {
        return obj.map(item => replaceBranding(item, yourName));
    }

    // Object ke har key ke liye
    const newObj = {};
    for (const key in obj) {
        const lowerKey = key.toLowerCase();
        // Agar key mein "branding" ya "developer" ya "join" hai to value replace karo
        if (lowerKey.includes('branding') || lowerKey.includes('developer') || lowerKey.includes('join')) {
            newObj[key] = yourName;
        }
        // Agar value object hai to recursion
        else if (typeof obj[key] === 'object') {
            newObj[key] = replaceBranding(obj[key], yourName);
        }
        // Otherwise value as it is
        else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

// CORS middleware – sabko allow karo
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 🚦 Root endpoint – yahi se data fetch hoga
app.get('/', async (req, res) => {
    try {
        // Query parameters
        const rc = req.query.rc || 'WB74BG4531';
        const key = req.query.key || 'DEMO';

        // Agar key DEMO nahi hai to bhi chalega, but original API key required?
        const originalUrl = `https://car-mix-fee-demo.vercel.app/?rc=${rc}&key=${key}`;
        
        // Fetch data from original API with timeout
        const response = await axios.get(originalUrl, { 
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        let originalData = response.data;

        // 🔥 Saari branding replace karo
        let modifiedData = replaceBranding(originalData);

        // Add your custom branding at root level (ensure override)
        modifiedData.branding = '@Akash_Exploits_bot';
        modifiedData.developer = '@Akash_Exploits_bot';
        modifiedData.join = '@akashishare1';
        modifiedData.fetched_at = new Date().toISOString();
        modifiedData.api_source = 'akash-vehicle-api';

        // Send response
        res.json(modifiedData);

    } catch (error) {
        console.error('Error:', error.message);
        
        // Agar axios error hai to status code handle karo
        if (error.response) {
            // Original API ne error diya
            res.status(error.response.status).json({
                error: 'Original API se error aaya',
                status: error.response.status,
                data: error.response.data,
                developer: '@Akash_Exploits_bot'
            });
        } else if (error.request) {
            // Request bheji par response nahi aaya
            res.status(504).json({
                error: 'Original API ne response nahi diya (timeout)',
                details: error.message,
                developer: '@Akash_Exploits_bot'
            });
        } else {
            // Kuch aur error
            res.status(500).json({
                error: 'Internal server error',
                message: error.message,
                developer: '@Akash_Exploits_bot'
            });
        }
    }
});

// 🔍 Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: '✅ LIVE',
        time: new Date().toISOString(),
        developer: '@Akash_Exploits_bot',
        join: '@akashishare1'
    });
});

// 404 handler – agar koi aur route hit kare to
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'Sirf root (/) aur /health endpoints kaam karte hain',
        developer: '@Akash_Exploits_bot'
    });
});

module.exports = app;
