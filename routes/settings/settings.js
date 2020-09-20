const express = require('express');
const router = express.Router();

const Settings = require('../../models/poolcontrol/settings');

//Alle Settings laden
router.get('/loadAllSettings', async (req, res) => {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, settings) => {
        if(err){
            console.log(err);
            return res.json({success: false});
        } else {
            return res.json({success: true, data: settings});
        }
    })
})

//Settings speichern
router.put('/saveSettings', async (req, res) => {
    console.log(req.body);

    const settings = await Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1);

    console.log(settings);

    if(settings){
        settings.shellyConnected = req.body.shellyConnected,
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
            shellyIp: req.body.shellyIp
        })

        console.log('dasfas')
        console.log(newSettings);

        newSettings.save();
        return res.json({success: true});
    }
})
module.exports = router; 