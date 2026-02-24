const express = require('express');
const axios = require('axios');
const app = express();

// 🔁 Recursive function to replace all "branding" fields with your name
function replaceBranding(obj, yourName = '@Akash_Exploits_bot') {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => replaceBranding(item, yourName));
    }

    const newObj = {};
    for (const key in obj) {
        if (key.toLowerCase() === 'branding') {
            // 🎯 Replace branding value with your name
            newObj[key] = yourName;
        } else if (typeof obj[key] === 'object') {
            newObj[key] = replaceBranding(obj[key], yourName);
        } else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

// 🚦 Main endpoint
app.get('/', async (req, res) => {
    const rc = req.query.rc || 'WB74BG4531';  // default vehicle
    const key = req.query.key || 'DEMO';

    try {
        // 📡 Fetch from original API
        const originalResponse = await axios.get(
            `https://car-mix-fee-demo.vercel.app/?rc=${rc}&key=${key}`,
            { timeout: 10000 }
        );

        let originalData = originalResponse.data;

        // 🎨 Replace all branding with your name
        const modifiedData = replaceBranding(originalData);

        // ✅ Add your custom credit at root level
        modifiedData.branding = '@Akash_Exploits_bot';
        modifiedData.developer = '@Akash_Exploits_bot';
        modifiedData.join = '@akashishare1';
        modifiedData.fetched_at = new Date().toISOString();

        res.json(modifiedData);

    } catch (error) {
        console.error('Fetch error:', error.message);
        res.status(500).json({
            error: 'Data fetch nahi ho paya',
            message: error.message,
            suggestion: 'Thodi der baad try karein ya rc/key check karein',
            developer: '@Akash_Exploits_bot'
        });
    }
});

// 🔍 Health check
app.get('/health', (req, res) => {
    res.json({
        status: '✅ LIVE',
        time: new Date().toISOString(),
        developer: '@Akash_Exploits_bot',
        join: '@akashishare1'
    });
});

module.exports = app;
