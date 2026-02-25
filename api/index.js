const express = require('express');
const axios = require('axios');
const app = express();

// ========== 🔑 KEY STORAGE ==========
// In-memory object – प्रोडक्शन में डेटाबेस यूज़ करें
const KEYS = {
    // आपकी माँगी हुई keys:
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
    // आप चाहें तो और keys डाल सकते हैं
};

// हेल्पर: की वैलिडिटी और एक्सपायरी चेक
function isValidKey(key) {
    const keyData = KEYS[key];
    if (!keyData) return false;
    const now = new Date();
    const expiry = new Date(keyData.expiry);
    return now < expiry;
}

function getKeyDetails(key) {
    return KEYS[key] || null;
}

// ========== 🎨 BRANDING REPLACE ==========
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
    const key = req.query.key;

    // 1️⃣ KEY चेक
    if (!key) {
        return res.status(400).json({
            error: "Missing 'key' parameter",
            developer: '@Akash_Exploits_bot'
        });
    }

    if (!isValidKey(key)) {
        return res.status(403).json({
            error: "Invalid or expired key",
            developer: '@Akash_Exploits_bot',
            hint: "Contact @akashishare1 for a valid key"
        });
    }

    const keyDetails = getKeyDetails(key);

    try {
        // 2️⃣ ORIGINAL API कॉल
        const originalUrl = `https://car-mix-fee-demo.vercel.app/?rc=${userRC}&key=${key}`;
        console.log(`[${new Date().toISOString()}] Fetching: ${originalUrl}`);

        const response = await axios.get(originalUrl, {
            timeout: 15000, // 15 sec
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });

        // 3️⃣ ब्रांडिंग बदलें और key_info जोड़ें
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
        // 4️⃣ ORIGINAL API FAIL – बैकअप डेटा भेजें
        console.error(`[${new Date().toISOString()}] Original API failed for RC: ${userRC}`, error.message);

        const backupData = {
            status: "success",
            vehicle_identity: userRC,
            data_nodes: {
                "Api 1": {
                    status: "success",
                    vehicle_details: {
                        registration_no: userRC,
                        owner_name: "PUJA SINGH",    // डेमो नाम
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
            note: "Original API se fetch nahi ho paya, backup data diya gaya hai.",
            error_debug: error.message // (optional) डीबग के लिए
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

// ========== 🔐 ADMIN: GENERATE NEW KEY ==========
// इस एंडपॉइंट को प्रोडक्शन में प्रोटेक्ट करें (जैसे master password)
app.get('/generate-key', (req, res) => {
    const { owner, days } = req.query;
    if (!owner || !days) {
        return res.status(400).json({
            error: "Missing parameters. Use: /generate-key?owner=NAME&days=NUMBER"
        });
    }

    // नई key बनाएँ (random string)
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
        owner: owner,
        note: 'Iss key ko ab main endpoint mein use kar sakte hain.'
    });
});

// ========== 🌐 SERVER START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Predefined keys:`);
    console.log(`- AKASH_PARMA (expires: ${KEYS.AKASH_PARMA.expiry})`);
    console.log(`- AKASH_PAID30DAYS (expires: ${KEYS.AKASH_PAID30DAYS.expiry})`);
    console.log(`- AKASH_FREE (expires: ${KEYS.AKASH_FREE.expiry})`);
});

module.exports = app; // Vercel के लिए export
