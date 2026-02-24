const express = require('express');
const axios = require('axios');
const app = express();

// 💾 Backup data agar original API down ho
const backupData = {
  "status": "success",
  "vehicle_identity": "WB74BG4531",
  "data_nodes": {
    "Api 1": {
      "status": "success",
      "vehicle_details": {
        "registration_no": "WB74BG4531",
        "owner_name": "PUJA SINGH",
        "maker_model": "ACCESS 125"
      },
      "branding": "@Akash_Exploits_bot"
    }
  },
  "branding": "@Akash_Exploits_bot",
  "developer": "@Akash_Exploits_bot",
  "join": "@akashishare1"
};

// Replace branding function
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
    try {
        const rc = req.query.rc || 'WB74BG4531';
        const key = req.query.key || 'DEMO';
        const originalUrl = `https://car-mix-fee-demo.vercel.app/?rc=${rc}&key=${key}`;
        
        // 15 second timeout ke saath fetch
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
        console.log('Original API down, using backup data');
        
        // Backup data bhejo with your branding
        backupData.vehicle_identity = req.query.rc || 'WB74BG4531';
        backupData.fetched_at = new Date().toISOString();
        backupData.note = 'Original API slow tha, isliye backup data diya';
        
        res.json(backupData);
    }
});

module.exports = app;
