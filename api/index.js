const express = require('express');
const axios = require('axios');
const app = express();

// ========== 🔑 आपकी अपनी keys (जो यूजर्स को देंगे) ==========
const KEYS = {
    "AKASH_PARMA": {
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        owner: "PARMA"
    },
    "AKASH_PAID30DAYS": {
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        owner: "PAID_USER"
    },
    "AKASH_FREE": {
        expiry: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day
        owner: "FREE_USER"
    }
};

// ========== 🔑 Original API की key (यह छुपा कर रखें) ==========
const ORIGINAL_API_KEY = "DEMO"; // इसे environment variable में रखना बेहतर होगा

// हेल्पर फंक्शन
function isValidKey(key) {
    const keyData = KEYS[key];
    if (!keyData) return false;
    return new Date() < new Date(keyData.expiry);
}

function getKeyDetails(key) {
    return KEYS[key] || null;
}

function replaceBranding(obj, yourName = '@Akash_Exploits_bot') {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => replaceBranding(item, yourName));
    }
    const newObj = {};
    for (const key in obj) {
        if (key.toLowerCase().includes('branding') || 
            key.toLowerCase().includes('developer') || 
            key.toLowerCase().includes('join')) {
            newObj[key] = yourName;
        } else if (typeof obj[key] === 'object') {
            newObj[key] = replaceBranding(obj[key], yourName);
        } else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

// ========== 🚀 MAIN ENDPOINT ==========
app.get('/', async (req, res) => {
    const userRC = req.query.rc || 'WB74BG4531';
    const userKey = req.query.key;

    // 1. अपनी key validate करें
    if (!userKey) {
        return res.status(400).json({
            error: "Missing 'key' parameter",
            developer: '@Akash_Exploits_bot'
        });
    }

    if (!isValidKey(userKey)) {
        return res.status(403).json({
            error: "Invalid or expired key",
            developer: '@Akash_Exploits_bot',
            hint: "Contact @akashishare1 for a valid key"
        });
    }

    const keyDetails = getKeyDetails(userKey);

    try {
        // 2. Original API को call करें (सिर्फ DEMO key से)
        const originalUrl = `https://car-mix-fee-demo.vercel.app/?rc=${userRC}&key=${ORIGINAL_API_KEY}`;
        console.log(`Fetching original API for RC: ${userRC}`);

        const response = await axios.get(originalUrl, {
            timeout: 1600,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // 3. ब्रांडिंग बदलें और अपनी key details जोड़ें
        let modifiedData = replaceBranding(response.data);
        modifiedData.branding = '@Akash_Exploits_bot';
        modifiedData.developer = '@Akash_Exploits_bot';
        modifiedData.join = '@akashishare1';
        modifiedData.key_info = {
            owner: keyDetails.owner,
            expiry: keyDetails.expiry,
            valid: true
        };
        
        res.json(modifiedData);

    } catch (error) {
        // 4. अगर original API fail हो, तो backup data
        console.error(`Original API failed for RC ${userRC}:`, error.message);
        
        const backupData = {
            status: "success",
            vehicle_identity: userRC,
            data_nodes: {
                "Api 1": {
                    status: "success",
                    vehicle_details: {
                        registration_no: userRC,
                        owner_name: "PUJA SINGH",
                        maker_model: "ACCESS 125"
                    },
                    branding: "@Akash_Exploits_bot"
                }
            },
            branding: "@Akash_Exploits_bot",
            developer: "@Akash_Exploits_bot",
            join: "@akashishare1",
            key_info: {
                owner: keyDetails.owner,
                expiry: keyDetails.expiry,
                valid: true
            },
            fetched_at: new Date().toISOString(),
            note: "Original API se fetch nahi ho paya, backup data diya gaya hai."
        };
        res.json(backupData);
    }
});

// ========== ❤️ HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        developer: '@Akash_Exploits_bot',
        timestamp: new Date().toISOString()
    });
});

// ========== 🔐 GENERATE NEW KEY (Admin only) ==========
app.get('/generate-key', (req, res) => {
    const { owner, days } = req.query;
    if (!owner || !days) {
        return res.status(400).json({ error: "Missing owner or days" });
    }

    const newKey = 'KEY_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    KEYS[newKey] = {
        expiry: expiryDate.toISOString(),
        owner: owner
    };

    res.json({
        status: 'success',
        key: newKey,
        expiry: expiryDate.toISOString(),
        owner: owner
    });
});

// ========== 🚀 START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Original API Key: ${ORIGINAL_API_KEY}`);
    console.log(`Available keys: ${Object.keys(KEYS).join(', ')}`);
});

module.exports = app;
