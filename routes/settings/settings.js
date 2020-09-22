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
    console.log(req.body);
    const settings = await Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1);

    if(settings){
        settings.shellyConnected = req.body.shellyConnected;
        settings.raspberryPiConnected = req.body.raspberryPiConnected;
        settings.shellyIp = req.body.shellyIp;

        settings.sensor1name = req.body.sensor1name;
        settings.sensor1id = req.body.sensor1id;
        settings.sensor2name = req.body.sensor2name;
        settings.sensor2id = req.body.sensor2id;
        settings.sensor3name = req.body.sensor3name;
        settings.sensor3id = req.body.sensor3id;
        settings.sensor4name = req.body.sensor4name;
        settings.sensor4id = req.body.sensor4id;
        settings.sensor5name = req.body.sensor5name;
        settings.sensor5id = req.body.sensor5id;
        settings.sensor6name = req.body.sensor6name;
        settings.sensor6id = req.body.sensor6id;
        settings.sensor7name = req.body.sensor7name;
        settings.sensor7id = req.body.sensor7id;
        settings.sensor8name = req.body.sensor8name;
        settings.sensor8id = req.body.sensor8id;
            

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