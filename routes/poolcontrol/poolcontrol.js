const express = require('express');
const router = express.Router();
const ds18b20 = require('ds18b20');
const Runtime = require('../../models/poolcontrol/runtime');
const Solar = require('../../models/poolcontrol/solar');

const ShellyIot = require('shelly-iot');
const Shelly = new ShellyIot({});

const Settings = require('../../models/poolcontrol/settings');

var gpio = require('rpi-gpio')
var gpiop = gpio.promise;

function getTemp(id) {
    return new Promise((resolve) => {
        ds18b20.temperature(id, (err, value) => {
            resolve({ id, t: value });
        });
    });
}

// Async Call des Shellys
function asyncCallDevice(device, command) {
    return new Promise((resolve, reject) => {
        Shelly.callDevice(device, command, (error, response, data) => {
            if (error) {
                return reject(error);
            }
            return resolve(response);
        })
    });
}

//Temperaturen aller Sensoren jetzt aktuell laden
router.get('/getTemperatureFromAllSensors', (req, res) => {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
        if(settings != null && settings.raspberryPiConnected) {
            ds18b20.sensors((err, ids) => {
                if(err){
                    console.log(err);
                    return res.json({success: false});
                } else {
                    const temps = [];
                    for(i = 0; i < ids.length; i += 1) {
                        temps.push(getTemp(ids[i]));
                    }
                    
                    Promise.all(temps).then(values => {
                        return res.status(200).json({success: true, data: values});
                    });
                }
            });
        } else {
            return res.json({success: false});
        }
    })   
})

//Relay am Shelly An- bzw. Ausschalten
router.get('/toggleDevice/:deviceId', async (req, res) => {
    console.log('REQ-GET | poolControl.js | /toggleDevice');
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, settings) => {
        if(settings != null && settings.shellyConnected) {
            if((settings.pumpConnectedShellyRelay === req.params.deviceId) && (settings.activateFilterInterval1 || settings.activateFilterInterval2 || settings.activateFilterInterval3)){
                return res.json({success: false, msg: 'Bitte deaktivieren Sie die automatische Pumpensteuerung um wieder manuell steuern zu können.'});
            }
            Shelly.callDevice(settings.shellyIp, '/relay/' + req.params.deviceId + '?turn=toggle', (error, response, data) => {
                if(error){
                    console.log(error);
                    return res.json({success: false});
                } else {
                    // Wenn das Gerät eingeschaltet wurde, wird ein neuer Eintrag in der RuntimeDB erzeugt.
                    // Diesem Eintrag wird ein Startdatum hinzugefügt.
                    if(response.ison){
                        let dateHelper = new Date();
                        let dateHelperToday = dateHelper.toISOString().substr(0,10);
                        let newRuntime = new Runtime({
                            relay: req.params.deviceId,
                            date: dateHelperToday,
                            startTime: new Date()
                        });
        
                        newRuntime.save();
                        return res.json({success: true, data: response});
                    } else {
                    // Wenn das Gerät ausgeschaltet wurde, wird der letzte Eintrag herangezogen und das Enddatum gesetzt
                        Runtime.findOne().where({'relay': req.params.deviceId}).sort({ field: 'asc', _id: -1}).exec((err, runtime) => {
                            runtime.set({
                                endTime: new Date()
                            })
        
                            let calcHelper = runtime.endTime - runtime.startTime;
        
                            runtime.set({
                                calculatedTime: calcHelper
                            })
        
                            runtime.save();
        
                            return res.json({success: true, data: response});
                        })
                    }
                }   
            });
        } else {
            return res.json({success: false});
        }
    })
  
})

//Status des Relays abfragen
router.get('/getDeviceStatus/:deviceId', async (req, res) => {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, settings) => {
        if(settings != null && settings.shellyConnected) {
            Shelly.callDevice(settings.shellyIp, '/relay/' + req.params.deviceId, (err, response, data) => {
                if(err){
                    console.log(err)
                    return res.json({success: false});
                } else {
                    return res.json({success: true, data: response, deviceId: req.params.deviceId})
                }
            }); 
        } else {
            return res.json({success: false});
        }
    })
})

//Verbrauch des Relays abfragen
router.get('/getRelayLoad', async (req, res) => {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, settings) => {
        if(settings != null && settings.shellyConnected){
            Shelly.callDevice(settings.shellyIp, '/status', (error, response, data) => {
                if(error){
                    return res.json({success: false});
                } else {
                    return res.json({success: true, data: response.meters, relays: response.relays});
                }
            }); 
        } else {
            return res.json({success: false});
        }
    })
     
})

//Solarumstellen mit Prüfung, ob Relay wirklich deaktiviert ist!
router.get('/solar/:solarValue', async (req, res) => {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
        if(settings != null && settings.shellyConnected){
            if(settings.automatedSolarActivation || settings.automatedWatertemperatureDeactivation){
                return res.json({success: false, msg: 'Bitte deaktivieren Sie für eine manuelle Steuerung der Solaranlage zunächst die aktivierten Automatismen.'});
            }
            try {
                await asyncCallDevice(settings.shellyIp, '/relay/' + settings.pumpConnectedShellyRelay + '?turn=off');
                const status = await asyncCallDevice(settings.shellyIp, '/status');

                let pumpRelay = parseInt(settings.pumpConnectedShellyRelay);
        
                if(status.relays[pumpRelay].ison || status.meters[pumpRelay].power > 100) {
                    return res.json({success: false, msg: 'Pumpe ließ sich nicht ausschalten!'});
                } else {
                    setTimeout(async () => {
                        if(req.params.solarValue === 'off') {
                            Solar.findOne({isOn: true}).exec(async (err, solar) => {
                                if(err) {
                                    console.log(err);
                                } else if(solar.length = 0) {
                                    console.log('Kein Eintrag gefunden!');
                                } else {

                                    let gpiop16 = await gpiop.setup(16, gpiop.DIR_OUT).then(() => {
                                        return gpiop.write(16, false)
                                    }).catch((err) => {
                                        console.log('Error: ', err.toString())
                                    })

                                    let gpiop18 = await gpiop.setup(18, gpiop.DIR_OUT).then(() => {
                                        return gpiop.write(18, true)
                                    }).catch((err) => {
                                        console.log('Error: ', err.toString())
                                    })

                                    solar.set({
                                        isOn: false,
                                        justSwitched: true
                                    })
        
                                    solar.save();
                                    setTimeout(() => {
                                        solar.set({
                                            justSwitched: false
                                        });
                                        solar.save();
                                    }, 90000)
                                }
                            })
                            
                        } else if (req.params.solarValue === 'on') {
                            Solar.findOne({isOn: false}).exec(async (err, solar) => {
        
                                if(err) {
                                    console.log(err)
                                } else if(solar === null) {
                                    console.log('Kein Eintrag gefunden.');
                                    return res.json({success: false})
                                } else {

                                    let gpiop16 = await gpiop.setup(16, gpiop.DIR_OUT).then(() => {
                                        return gpiop.write(16, true)
                                    }).catch((err) => {
                                        console.log('Error: ', err.toString())
                                    })

                                    let gpiop18 = await gpiop.setup(18, gpiop.DIR_OUT).then(() => {
                                        return gpiop.write(18, false)
                                    }).catch((err) => {
                                        console.log('Error: ', err.toString())
                                    })

                                    solar.set({
                                        isOn: true,
                                        justSwitched: true
                                    });
                                    solar.save();
                                    setTimeout(() => {
                                        solar.set({
                                            justSwitched: false
                                        });

                                        solar.save();
                                    }, 90000)
                                }
                            })
                            
                        }
                    }, 10000)
            
                    setTimeout(async() => {
                        let gpiop16 = await gpiop.setup(16, gpiop.DIR_OUT).then(() => {
                            return gpiop.write(16, true)
                        }).catch((err) => {
                            console.log('Error: ', err.toString())
                        })

                        let gpiop18 = await gpiop.setup(18, gpiop.DIR_OUT).then(() => {
                            return gpiop.write(18, true)
                        }).catch((err) => {
                            console.log('Error: ', err.toString())
                        })
                        asyncCallDevice(settings.shellyIp, '/relay/' + settings.pumpConnectedShellyRelay + '?turn=on');
                    }, 30000)
            
                    return res.json({success: true});
                }
        
                
        
            } catch (e) {
                if(e.message.includes('EHOSTUNREACH')){
                    console.log('Kann Shelly nicht erreichen - IP korrekt?');
                    return res.json({success: false, msg: 'Kann Shelly nicht erreichen - IP korrekt?'});
                } else {
                    return res.json({success: false, msg: 'Fehler beim Umstellen der Solarsteuerung!'});
                }
            }
        } else {
            return res.json({success: false});
        }
    });


    


})

//Laufzeiten des Relays abfragen
router.get('/relayRuntime/:relayId', async (req, res) => {
    let dateHelper = new Date();
    let dateHelperToday = dateHelper.toISOString().substr(0,10);
    Runtime.find({date: dateHelperToday}).where({'relay': req.params.relayId}).exec((err, runtimes) => {
        if(err || runtimes.length === 0){
            return res.json({success: false});
        } else {
            if(runtimes) {

                let totalRuntime = 0;
    
                for(i = 0; i < runtimes.length; i++) {
                    if(runtimes[i].calculatedTime) {
                        totalRuntime = totalRuntime + runtimes[i].calculatedTime;
                    } else {
                        //Wenn die Uhr gerade läuft, muss die Zeit berechnet werden, seit Aktivierung der Uhr bis zum jetzigen Zeitpunkt
    
                        let actualTime = new Date().getTime();
                        let calculatedTime = actualTime - runtimes[i].startTime;
    
                        totalRuntime = totalRuntime + calculatedTime;
                    }
                    
                }
                // Umrechnung von Millisekunden in Sekunden, anschließend in Minuten.
                totalRuntime = (totalRuntime / 1000) / 60;
                // Umwandlung in String um Nachkommawerte zu entferne.
                totalRuntimeMinutes = totalRuntime.toString();
                totalRuntimeMinutes = totalRuntimeMinutes.split('.');
                // Rückumwandlung in Int
                totalRuntimeMinutes = parseInt(totalRuntimeMinutes);
                let response = {
                    runtime: totalRuntimeMinutes,
                    relay: req.params.relayId
                }
    
                return res.json({success: true, data: response});
            } else {
                return res.json({success: false, msg:'Keine Zeiten gefunden!'});
            }
        }
    })
})

// Ermittlung des Solarwertes - Ist Solar aktuell an oder aus
router.get('/getSolar', async (req, res) => {
    Solar.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, solar) => {
        if(err){
            console.log(err);
        }
        if(solar.length === 0) {
            newSolar = new Solar({
                isOn: false
            })

            newSolar.save((err, savedSolar) => {
                return res.json({success: true, data: savedSolar})
            })
        } else {
            return res.json({success: true, data: solar});
        }
    })  
})

module.exports = router; 