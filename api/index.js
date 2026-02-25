const express = require('express');
const axios = require('axios');
const app = express();

// ========== KEY MANAGEMENT (IN-MEMORY) ==========
// Keys with relative expiry
const KEYS = {
    "AKASH_PARMA": { expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), owner: "PARMA" },
    "AKASH_PAID30DAYS": { expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), owner: "PAID_USER" },
    "AKASH_FREE": { expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), owner: "FREE_USER" }
};

// Helper: check if key is valid and not expired
function isValidKey(key) {
    const keyData = KEYS[key];
    if (!keyData) return false;
    const now = new Date();
    const expiry = new Date(keyData.expiry);
    return now < expiry;
}

// Helper: get key details
function getKeyDetails(key) {
    return KEYS[key] || null;
}

// ========== BRANDING FUNCTION ==========
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

// ========== MAIN ENDPOINT ==========
app.get('/', async (req, res) => {
    const userRC = req.query.rc || 'WB74BG4531';
    const key = req.query.key;

    // 1. KEY VALIDATION
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
        // 2. CALL ORIGINAL API
        const originalUrl = `https://car-mix-fee-demo.vercel.app/?rc=${userRC}&key=${key}`;
        const response = await axios.get(originalUrl, { 
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

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
        console.log('Original API down, using backup data for RC:', userRC);

        // 3. BACKUP DATA (only if key is valid)
        const backupData = {
            "status": "success",
            "vehicle_identity": userRC,
            "data_nodes": {
                "Api 1": {
                    "status": "success",
                    "vehicle_details": {
                        "registration_no": userRC,
                        "owner_name": "PUJA SINGH",
                        "maker_model": "ACCESS 125"
                    },
                    "branding": "@Akash_Exploits_bot"
                }
            },
            "branding": "@Akash_Exploits_bot",
            "developer": "@Akash_Exploits_bot",
            "join": "@akashishare1",
            "key_info": {
                owner: keyDetails.owner,
                expiry: keyDetails.expiry,
                valid: true
            },
            "fetched_at": new Date().toISOString(),
            "note": "Original API se fetch nahi ho paya, backup data diya"
        };

        res.json(backupData);
    }
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        developer: '@Akash_Exploits_bot',
        timestamp: new Date().toISOString()
    });
});

// ========== (OPTIONAL) KEY GENERATION ENDPOINT ==========
// Sirf demo/admin ke liye – real use mein secure karna hoga
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

module.exports = app;
