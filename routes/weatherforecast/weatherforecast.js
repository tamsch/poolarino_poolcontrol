const express = require('express');
const router = express.Router();

const Settings = require('../../models/poolcontrol/settings');

const fetch = require('node-fetch');

//Wettervorschau laden
router.get('/forecast', async (req, res) => {
    const settings = await Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1);

    fetch('http://api.openweathermap.org/data/2.5/forecast?q=' + settings.weatherCity + ',' + settings.weatherCountryCode + '&units=metric&appid=' + settings.weatherAppId + '', { method: 'GET' })
    .then(res => res.json()) // expecting a json response
    .then(json => {
        return res.json({success: true, data: json});
    });
})

module.exports = router; 