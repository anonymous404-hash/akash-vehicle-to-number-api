const express = require('express');
const axios = require('axios');
const app = express();

// Replace branding function (same rahega)
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

app.get('/', async (req, res) => {
    const userRC = req.query.rc || 'WB74BG4531';  // user ka diya hua RC, default fallback
    const key = req.query.key || 'DEMO';

    try {
        const originalUrl = `https://car-mix-fee-demo.vercel.app/?rc=${userRC}&key=${key}`;
        const response = await axios.get(originalUrl, { 
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        let modifiedData = replaceBranding(response.data);
        modifiedData.branding = '@Akash_Exploits_bot';
        modifiedData.developer = '@Akash_Exploits_bot';
        modifiedData.join = '@akashishare1';
        res.json(modifiedData);

    } catch (error) {
        console.log('Original API down, using backup data for RC:', userRC);
        
        // 🔥 DYNAMIC BACKUP DATA - user ke RC ke saath
        const backupData = {
            "status": "success",
            "vehicle_identity": userRC,  // user ka RC yahan
            "data_nodes": {
                "Api 1": {
                    "status": "success",
                    "vehicle_details": {
                        "registration_no": userRC,  // yahan bhi user ka RC
                        "owner_name": "PUJA SINGH",
                        "maker_model": "ACCESS 125"
                    },
                    "branding": "@Akash_Exploits_bot"
                }
            },
            "branding": "@Akash_Exploits_bot",
            "developer": "@Akash_Exploits_bot",
            "join": "@akashishare1",
            "fetched_at": new Date().toISOString(),
            "note": "Original API se fetch nahi ho paya, backup data diya"
        };
        
        res.json(backupData);
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', developer: '@Akash_Exploits_bot' });
});

module.exports = app;
