const express = require('express');
const router = express.Router();
const ds18b20 = require('ds18b20');
const Temperature = require('../../models/poolcontrol/temperature');
const Runtime = require('../../models/poolcontrol/runtime');
const Solar = require('../../models/poolcontrol/solar');

const ShellyIot = require('shelly-iot');
const Shelly = new ShellyIot({});

var shell = require('shelljs');

var gpio = require('rpi-gpio')
var gpiop = gpio.promise;

function getTemp(id) {
    return new Promise((resolve, reject) => {
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
            console.log(response);
            return resolve(response);
        })
    });
}

//Temperaturen aller Sensoren jetzt aktuell laden
router.get('/getTemperatureFromAllSensors', (req, res) => {
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
})

//Laden der Temperaturen für Anzeige des Graphen
router.get('/getTemperaturesForGraphForSensor/:sensorId', async (req, res) => {
    const temps = await Temperature.find({'sensor': req.params.sensorId}).select('temperature time -_id');
    return res.status(200).json({success: true, data: temps});
})

//Relay am Shelly An- bzw. Ausschalten
router.get('/toggleDevice/:deviceId', async (req, res) => {
    console.log('REQ-GET | poolControl.js | /toggleDevice');
    Shelly.callDevice('192.168.178.48', '/relay/' + req.params.deviceId + '?turn=toggle', (error, response, data) => {
        if(error){
            return res.json({success: false});
        } else {
            if(req.params.deviceId === '3' || req.params.deviceId === '0'){
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
                
            } else {
                return res.json({success: true, data: response});
            }     
        }   
    });  
})

//Status des Relays abfragen
router.get('/getDeviceStatus/:deviceId', async (req, res) => {
    Shelly.callDevice('192.168.178.48', '/relay/' + req.params.deviceId, (error, response, data) => {
        if(error){
            console.log(error)
            return res.json({success: false});
        } else {
            return res.json({success: true, data: response})
        }
        
    });  
})

//Verbrauch des Relays abfragen
router.get('/getRelayLoad', async (req, res) => {
    Shelly.callDevice('192.168.178.48', '/status', (error, response, data) => {
        if(error){
            return res.json({success: false});
        } else {
            return res.json({success: true, data: response.meters, relays: response.relays});
        }
        
    });  
})

//Solarumstellen mit Prüfung, ob Relay wirklich deaktiviert ist!
router.get('/solar/:solarValue', async (req, res) => {

    try {

        await asyncCallDevice('192.168.178.48', '/relay/0?turn=off');
        const status = await asyncCallDevice('192.168.178.48', '/status');


        if(status.relays[0].ison || status.meters[0].power > 350 || status.meters[1].power > 350 || status.meters[2].power > 350 || status.meters[3].power > 350) {

            return res.json({success: false, msg: 'Pumpe ließ sich nicht ausschalten!'});
        } else {
            setTimeout(() => {
                if(req.params.solarValue === 'off') {
                    Solar.findOne({isOn: true}).exec((err, solar) => {
                        if(err) {
                            console.log(err);
                        } else if(solar.length = 0) {
                            console.log('Kein Eintrag gefunden!');
                        } else {


                            shell.exec('gpio write 10 0');
                            shell.exec('gpio write 11 1');
                            console.log('asdf');
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
                    Solar.findOne({isOn: false}).exec((err, solar) => {

                        if(err) {
                            console.log(err)
                        } else if(solar.length = 0) {
                            console.log('Kein Eintrag gefunden.')
                        } else {
                            shell.exec('gpio write 10 1');
                            shell.exec('gpio write 11 0');
                            solar.set({
                                isOn: true,
                                justSwitched: true
                            });
                            solar.save();
                            setTimeout(() => {
                                solar.set({
                                    justSwitched: false
                                });
                                console.log('m,nm,,');
                                solar.save();
                            }, 90000)
                        }
                    })
                    
                }
            }, 10000)
    
            setTimeout(() => {
                shell.exec('gpio write 10 1');
                shell.exec('gpio write 11 1');
                asyncCallDevice('192.168.178.48', '/relay/0?turn=on');
            }, 30000)
    
            return res.json({success: true, msg: ''});
        }

        

    } catch {
        return res.json({success: false, msg: 'Pumpe ließ sich nicht ausschalten!'});
    }


})

//Laufzeiten des Relays abfragen
router.get('/relayRuntime/:relayId', async (req, res) => {
    let dateHelper = new Date();
    let dateHelperToday = dateHelper.toISOString().substr(0,10);
    Runtime.find({date: dateHelperToday}).where({'relay': req.params.relayId}).exec((err, runtimes) => {
        if(err){
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
    Solar.find().exec((err, solar) => {
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

//Ermittlung der aktuellen Stellung des Kugelhahns
router.get('/getSolarState', async (req, res) => {
    
    const gpio23 = await gpiop.read(16);
    const gpio24 = await gpiop.read(18);

    // const gpio23 = await shell.exec('cat /sys/class/gpio/gpio23/value');
    // const gpio24 = await shell.exec('cat /sys/class/gpio/gpio24/value');

    

    setTimeout(() => {
        if(gpio24 && !gpio23){
            let helper = {
                isOn: false
            }

            return res.json({success: true, data: helper});
        } else if(!gpio24 && gpio23){
            let helper = {
                isOn: true
            }

            return res.json({success: true, data: helper});
        } else {
            return res.json({success: false});
        }

        
    }, 500)

    
})

module.exports = router; 