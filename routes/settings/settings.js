const express = require('express');
const router = express.Router();

const Settings = require('../../models/poolcontrol/settings');

//Alle Settings laden
router.get('/loadAllSettings', async (req, res) => {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, settings) => {
        if(err || settings == null){
            console.log(err);
            return res.json({success: false});
        } else {
            return res.json({success: true, data: settings});
        }
    })
})

//Settings speichern
router.put('/saveSettings', async (req, res) => {
    const settings = await Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1);

    if(settings){
        settings.shellyConnected = req.body.shellyConnected,
        settings.raspberryPiConnected = req.body.raspberryPiConnected,
        settings.shellyIp = req.body.shellyIp

        await settings.save((err, saved) => {
            if(err){
                console.log(err);
                return res.json({success: false});
            } else {
                return res.json({success: true});
            }
        });


    } else {
        console.log(req.body);
        newSettings = new Settings({
            shellyConnected: req.body.shellyConnected,
            raspberryPiConnected: req.body.raspberryPiConnected,
            shellyIp: req.body.shellyIp
        })

        newSettings.save();
        return res.json({success: true});
    }
})
module.exports = router; 