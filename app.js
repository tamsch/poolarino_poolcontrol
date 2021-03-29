const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const versionInfo = require('./config/versionInfo');
const config = require('./config/database');
const ds18b20 = require('ds18b20');
const Temperature = require('./models/poolcontrol/temperature');
const errorHandler = require('express-error-handler');
const Solar = require('./models/poolcontrol/solar');
const Runtime = require('./models/poolcontrol/runtime');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const geoip = require('geoip-lite');
const publicIp = require('public-ip');

const ShellyIot = require('shelly-iot');
const Shelly = new ShellyIot({});

const Settings = require('./models/poolcontrol/settings');

var gpio = require('rpi-gpio');
var gpiop = gpio.promise;

//Connect to Database
mongoose.connect(config.database, {
    socketTimeoutMS: 0,
    keepAlive: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

//On Connection log to console
mongoose.connection.on('connected', () => {
    console.log('connected to database ' + config.database);
});

//On Error
mongoose.connection.on('err', () => {
    console.log('database error: ' + err);
});

const app = express();

const poolControl = require('./routes/poolcontrol/poolcontrol');
const weatherForecast = require('./routes/weatherforecast/weatherforecast');
const settings = require('./routes/settings/settings');


//Port Number
const port = 3000;

//CORS Middleware
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));

app.use(errorHandler({ dumpExceptions: true, showStack: true }));
// then, set the listener and do your stuff...

//Setting up Routes
app.use('/poolcontrol', poolControl);
app.use('/weatherforecast', weatherForecast);
app.use('/settings', settings);

//Calling Index-Route
app.get('/', (req, res) => {
    res.send('Ungültige Route!');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

//Run server with nodemon
app.listen(port, () => {
    console.log('Server started on port ' + port);
});

// Async Call des Shellys
function asyncCallDevice(device, command) {
    return new Promise((resolve, reject) => {
        Shelly.callDevice(device, command, (error, response) => {
            if (error) {
                return reject(error);
            }
            return resolve(response);
        })
    });
}

// Setzen der neuen VersionInfo, initiale Anlage der Settings
Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
    if (settings != null) {
        settings.versionInfo = versionInfo.version;

        Solar.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, solar) => {
            if(solar != null){
                solar.justSwitched = false;

                solar.save();
            }
        })

        settings.save();
    } else {
        let sysInfo = await getOsInformation();
        let ipInformation = await getIpInformation();
        var country = 'notSet';
        var region = 'notSet';

        if(ipInformation.country){
            // var country = ipInformation.country;
            var country = 'notSet';
        } else {
            var country = 'notSet';
        }

        if(ipInformation.region){
            // var region = ipInformation.region;
            var region = 'notSet';
        } else {
            var region = 'notSet';
        }

        let newSettings = new Settings({
            versionInfo: versionInfo.version,
            osType: sysInfo[0],
            region: region,
            country: country,
            osVersion: sysInfo[1],
            machineId: sysInfo[2]
        })

        let newSolar = new Solar({
            isOn: false
        })

        newSolar.save();

        newSettings.save((err, savedSettings) => {
            if(err){
                console.log(err);
            }
        });
    }
})

function getTemp(id) {
    return new Promise((resolve) => {
        ds18b20.temperature(id, (err, value) => {
            resolve({ id, t: value });
        });
    });
}



// Trockenlauf- und Überdruckschutz der Pumpe - Prüft alle 10 Sekunden den Verbrauch
setInterval(function () {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, settings) => {
        if (settings != null && settings.shellyConnected) {
            Shelly.callDevice(settings.shellyIp, '/status', (error, response, data) => {
                if (error) {
                    // console.log(error)
                } else {
                    Solar.find().exec((err, solar) => {
                        if (err) {
                            console.log(err);
                        } else {

                            let pumpRelay = parseInt(settings.pumpConnectedShellyRelay);

                            /* if ((response.meters[pumpRelay].power < 400 || response.meters[pumpRelay].power > 500) && response.relays[pumpRelay].ison && !solar[0].justSwitched) {
                                Shelly.callDevice(settings.shellyIp, '/relay/'  + settings.pumpConnectedShellyRelay +  '?turn=off', (error, response, data) => {
                                    console.log('Pumpe notabgeschaltet!');
                                    let newGeneral = new General({
                                        emergencyShutdown: true,
                                        relay: pumpRelay,
                                        resolved: false
                                    })

                                    newGeneral.save();
                                });
                            } */
                        }


                    })
                }


            });
        }
    })

}, 5000);

// Prüft die automatische An- und Abschaltung der Pumpe
setInterval(function () {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, settings) => {
        if (settings != null && settings.shellyConnected && settings.pumpConnectedShellyRelay != '') {
            Solar.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, solar) => {
                if(solar != null && solar.justSwitched === false){
                    // Prüfe Aktivierung der Pumpe
                    let h = new Date().getHours();
                    let m = new Date();
                    let f = h + ':' + (m.getMinutes()<10?'0':'') + m.getMinutes();

                    if(settings.activateFilterInterval1){
                        if(settings.pumpActivationTime1 != '' && settings.pumpDeactivationTime1 != '' && !settings.justChangedInterval1){

                            if(f === settings.pumpActivationTime1){
                                Shelly.callDevice(settings.shellyIp, '/relay/'  + settings.pumpConnectedShellyRelay +  '?turn=on', (error, response, data) => {
                                    console.log('activated interval 1');
                                    if(response.ison){
                                        let dateHelper = new Date();
                                        let dateHelperToday = dateHelper.toISOString().substr(0,10);
                                        let newRuntime = new Runtime({
                                            relay: settings.pumpConnectedShellyRelay,
                                            date: dateHelperToday,
                                            startTime: new Date()
                                        });
                        
                                        newRuntime.save();

                                        settings.justChangedInterval1 = true;
                                        settings.save();

                                        setTimeout(async () => {
                                            settings.set({
                                                justChangedInterval1: false
                                            });
                                            settings.save();
                                        }, 90000)
                                    }

                                    if(error){
                                        console.log(error)
                                    }
                                });
                            }

                            if(f === settings.pumpDeactivationTime1){
                                Shelly.callDevice(settings.shellyIp, '/relay/'  + settings.pumpConnectedShellyRelay +  '?turn=off', (error, response, data) => {
                                    console.log('deactivated interval 1');
                                    Runtime.findOne().where({'relay': settings.pumpConnectedShellyRelay}).sort({ field: 'asc', _id: -1}).exec((err, runtime) => {
                                        runtime.set({
                                            endTime: new Date()
                                        })
                    
                                        let calcHelper = runtime.endTime - runtime.startTime;
                    
                                        runtime.set({
                                            calculatedTime: calcHelper
                                        })
                    
                                        runtime.save();

                                        settings.justChangedInterval1 = true;
                                        settings.save();

                                        setTimeout(async () => {
                                            settings.set({
                                                justChangedInterval1: false
                                            });
                                            settings.save();
                                        }, 90000)
                                    })
                                });
                            }
                        } else {
                            console.log('1 - Aktivierungs- oder Deaktivierungsinterval nicht gesetzt, oder die Channel-Stellung wurde gerade geändert!')
                        }
                    }

                    if(settings.activateFilterInterval2){
                        if(settings.pumpActivationTime2 != '' && settings.pumpDeactivationTime2 != '' && !settings.justChangedInterval2){
                            if(f === settings.pumpActivationTime2){
                                Shelly.callDevice(settings.shellyIp, '/relay/'  + settings.pumpConnectedShellyRelay +  '?turn=on', (error, response, data) => {
                                    console.log('activated interval 2');
                                    if(response.ison){
                                        let dateHelper = new Date();
                                        let dateHelperToday = dateHelper.toISOString().substr(0,10);
                                        let newRuntime = new Runtime({
                                            relay: settings.pumpConnectedShellyRelay,
                                            date: dateHelperToday,
                                            startTime: new Date()
                                        });
                        
                                        newRuntime.save();

                                        settings.justChangedInterval2 = true;
                                        settings.save();

                                        setTimeout(async () => {
                                            settings.set({
                                                justChangedInterval2: false
                                            });
                                            settings.save();
                                        }, 90000)
                                    }

                                    if(error){
                                        console.log(error)
                                    }
                                });
                            }

                            if(f === settings.pumpDeactivationTime2){
                                Shelly.callDevice(settings.shellyIp, '/relay/'  + settings.pumpConnectedShellyRelay +  '?turn=off', (error, response, data) => {
                                    console.log('activated interval 2');
                                    Runtime.findOne().where({'relay': settings.pumpConnectedShellyRelay}).sort({ field: 'asc', _id: -1}).exec((err, runtime) => {
                                        runtime.set({
                                            endTime: new Date()
                                        })
                    
                                        let calcHelper = runtime.endTime - runtime.startTime;
                    
                                        runtime.set({
                                            calculatedTime: calcHelper
                                        })
                    
                                        runtime.save();

                                        settings.justChangedInterval2 = true;
                                        settings.save();

                                        setTimeout(async () => {
                                            settings.set({
                                                justChangedInterval2: false
                                            });
                                            settings.save();
                                        }, 90000)
                                    })
                                });
                            }
                        } else {
                            console.log('2 - Aktivierungs- oder Deaktivierungsinterval nicht gesetzt, oder die Channel-Stellung wurde gerade geändert!')
                        }
                    }

                    if(settings.activateFilterInterval3){
                        if(settings.pumpActivationTime3 != '' && settings.pumpDeactivationTime3 != '' && !settings.justChangedInterval3){
                            if(f === settings.pumpActivationTime3){
                                Shelly.callDevice(settings.shellyIp, '/relay/'  + settings.pumpConnectedShellyRelay +  '?turn=on', (error, response, data) => {
                                    console.log('activated interval 3');
                                    if(response.ison){
                                        let dateHelper = new Date();
                                        let dateHelperToday = dateHelper.toISOString().substr(0,10);
                                        let newRuntime = new Runtime({
                                            relay: settings.pumpConnectedShellyRelay,
                                            date: dateHelperToday,
                                            startTime: new Date()
                                        });
                        
                                        newRuntime.save();

                                        settings.justChangedInterval3 = true;
                                        settings.save();

                                        setTimeout(async () => {
                                            settings.set({
                                                justChangedInterval3: false
                                            });
                                            settings.save();
                                        }, 90000)
                                    }

                                    if(error){
                                        console.log(error)
                                    }
                                });
                            }

                            if(f === settings.pumpDeactivationTime3){
                                Shelly.callDevice(settings.shellyIp, '/relay/'  + settings.pumpConnectedShellyRelay +  '?turn=off', (error, response, data) => {
                                    console.log('activated interval 3');
                                    Runtime.findOne().where({'relay': settings.pumpConnectedShellyRelay}).sort({ field: 'asc', _id: -1}).exec((err, runtime) => {
                                        runtime.set({
                                            endTime: new Date()
                                        })
                    
                                        let calcHelper = runtime.endTime - runtime.startTime;
                    
                                        runtime.set({
                                            calculatedTime: calcHelper
                                        })
                    
                                        runtime.save();

                                        settings.justChangedInterval3 = true;
                                        settings.save();

                                        setTimeout(async () => {
                                            settings.set({
                                                justChangedInterval3: false
                                            });
                                            settings.save();
                                        }, 90000)
                                    })
                                });
                            }
                        } else {
                            console.log('3 - Aktivierungs- oder Deaktivierungsinterval nicht gesetzt, oder die Channel-Stellung wurde gerade geändert!')
                        }
                    }
                } else {
                    //console.log('Keine Solareinstellungen gefunden oder Solar wurde oder wird gerade umgestellt - Automatische Pumpensteuerung nicht möglich!');
                }
            })
        } else {
            console.log('Automatische Aktivierung der Pumpe nicht möglich. Settings nicht gesetzt, Shelly nicht angeschlossen oder kein Channel für die Pumpe gewählt!');
        }
    })

}, 10000);


// Automatische Solarsteuerung
setInterval(function () {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
        let solar = await Solar.findOne().sort({ field: 'asc', _id: -1 }).limit(1);

        if(solar === null){

        } else {
            if(solar.justSwitched){
                console.log('Solar wurde oder wird gerade umgestellt - Automatische Steuerung derzeit nicht möglich!');
            } else {
                if(solar.isOn){
                    if(settings.automatedSolarActivation){
                        if(settings.temperatureSensorIdSkimmer != '' && settings.temperatureSensorIdSolar != '' && settings.temperatureSensorSolarActivation != '' && settings.temperatureSolarActivation != 0 && settings.temperatureSolarDeactivation != 0){
                            let temperatureHelper = settings.temperatureSensorSolarDeactivation.split('tempSensor');
                            let tempSkimmerHelper = settings.temperatureSensorIdSkimmer.split('tempSensor');

                            let dbSensor = 'sensor' + temperatureHelper[1] + 'id';
                            let dbSensorSkimmer = 'sensor' + tempSkimmerHelper[1] + 'id';
        
                            let solarDeactivationTemperature = await getTemp(settings[dbSensor]);
                            let skimmerDeactivationTemperature = await getTemp(settings[dbSensorSkimmer]);
        
                            console.log('Prüfe Solar Deaktivierung');
                            console.log('Ist-Temperatur: ' + solarDeactivationTemperature.t + 'C°');
                            console.log('Umstell-Schwellwert: ' + settings.temperatureSolarDeactivation + 'C°');

                            if(settings.automatedWatertemperatureDeactivation){
                                console.log('Prüfe Wassertemperatur-Deaktivierung');
                                console.log('Ist-Temperatur: ' + skimmerDeactivationTemperature.t + 'C°');
                                console.log('Umstell-Schwellwert: ' + settings.temperatureWaterDeactivation + 'C°');
                            }
                            
                            if(solarDeactivationTemperature.t <= settings.temperatureSolarDeactivation){
                                console.log('Starte Solar Deaktivierung');
                                let relayShutdown = await asyncCallDevice(settings.shellyIp, '/relay/' + settings.pumpConnectedShellyRelay + '?turn=off');
                                if(!relayShutdown.ison){
                                    Runtime.findOne().where({'relay': settings.pumpConnectedShellyRelay}).sort({ field: 'asc', _id: -1}).exec((err, runtime) => {
                                        runtime.set({
                                            endTime: new Date()
                                        })
                    
                                        let calcHelper = runtime.endTime - runtime.startTime;
                    
                                        runtime.set({
                                            calculatedTime: calcHelper
                                        })
                    
                                        runtime.save();
                                    })
                                    console.log('Pumpe abgeschaltet - warte auf Beruhigung des Wasserkreislaufes.');
                                    setTimeout(async () => {
                                        console.log('Wasserkreislauf beruhigt, beginne Solarabschaltung!');
                                        Solar.findOne({isOn: true}).exec(async (err, solar) => {
                                            if(err) {
                                                console.log(err);
                                            } else if(solar.length = 0) {
                                                console.log('Kein Eintrag gefunden!');
                                            } else {
                                                console.log('Beginne Umstellung des 3 Wege Ventils...');
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
                                    }, 4000)                                    
            
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
                                        console.log('3 Wege Ventil erfolgreich umgestellt - Solar deaktiviert!');
                                        asyncCallDevice(settings.shellyIp, '/relay/' + settings.pumpConnectedShellyRelay + '?turn=on');

                                        let dateHelper = new Date();
                                        let dateHelperToday = dateHelper.toISOString().substr(0,10);
                                        let newRuntime = new Runtime({
                                            relay: settings.pumpConnectedShellyRelay,
                                            date: dateHelperToday,
                                            startTime: new Date()
                                        });
                        
                                        newRuntime.save();

                                        console.log('Pumpe wieder angeschaltet');
                                    }, 30000)
                                }
        
                            } else if(settings.automatedWatertemperatureDeactivation && (skimmerDeactivationTemperature.t >= settings.temperatureWaterDeactivation)) {
                                console.log('Wunschtemperatur erreicht, beginne mit Solar Abschaltung...');
                                let relayShutdown = await asyncCallDevice(settings.shellyIp, '/relay/' + settings.pumpConnectedShellyRelay + '?turn=off');
                                if(!relayShutdown.ison){
                                    Runtime.findOne().where({'relay': settings.pumpConnectedShellyRelay}).sort({ field: 'asc', _id: -1}).exec((err, runtime) => {
                                        runtime.set({
                                            endTime: new Date()
                                        })
                    
                                        let calcHelper = runtime.endTime - runtime.startTime;
                    
                                        runtime.set({
                                            calculatedTime: calcHelper
                                        })
                    
                                        runtime.save();
                                    })
                                    console.log('Pumpe abgeschaltet - warte auf Beruhigung des Wasserkreislaufes.');
                                    setTimeout(async () => {
                                        console.log('Wasserkreislauf beruhigt, beginne Solarabschaltung!');
                                        Solar.findOne({isOn: true}).exec(async (err, solar) => {
                                            if(err) {
                                                console.log(err);
                                            } else if(solar.length = 0) {
                                                console.log('Kein Eintrag gefunden!');
                                            } else {
                                                console.log('Beginne Umstellung des 3 Wege Ventils...');
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
                                    }, 4000)                                    
            
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
                                        console.log('3 Wege Ventil erfolgreich umgestellt - Solar deaktiviert!');
                                        asyncCallDevice(settings.shellyIp, '/relay/' + settings.pumpConnectedShellyRelay + '?turn=on');

                                        let dateHelper = new Date();
                                        let dateHelperToday = dateHelper.toISOString().substr(0,10);
                                        let newRuntime = new Runtime({
                                            relay: settings.pumpConnectedShellyRelay,
                                            date: dateHelperToday,
                                            startTime: new Date()
                                        });
                        
                                        newRuntime.save();

                                        console.log('Pumpe wieder angeschaltet');
                                    }, 30000)
                                }
                            }
                        }
                    }
                } else {
                    if (settings != null && settings.shellyConnected) {
                        if(settings.automatedSolarActivation){
                            if(settings.temperatureSensorIdSkimmer != '' && settings.temperatureSensorIdSolar != '' && settings.temperatureSensorSolarActivation != '' && settings.temperatureSolarActivation != 0 && settings.temperatureSolarDeactivation != 0){
                                
                                let temperatureHelper = settings.temperatureSensorSolarActivation.split('tempSensor');
                                let dbSensor = 'sensor' + temperatureHelper[1] + 'id';
        
                                let solarActivationTemperature = await getTemp(settings[dbSensor]);
        
                                console.log('Prüfe Solar Aktivierung');
                                console.log('Ist-Temperatur: ' + solarActivationTemperature.t + 'C°');
                                console.log('Umstell-Schwellwert: ' + settings.temperatureSolarActivation + 'C°');

                                if(settings.automatedWatertemperatureDeactivation){

                                    let tempSkimmerHelper = settings.temperatureSensorIdSkimmer.split('tempSensor');
                                    let dbSensorSkimmer = 'sensor' + tempSkimmerHelper[1] + 'id';
                                    let skimmerDeactivationTemperature = await getTemp(settings[dbSensorSkimmer]);

                                    console.log('Prüfe Solar Aktivierung bezüglich der Wunschtemperatur');
                                    console.log('Ist-Temperatur: ' + skimmerDeactivationTemperature.t + 'C°');
                                    console.log('Wunschtemperatur: ' + settings.temperatureWaterDeactivation + 'C°');
                                    console.log('Ergebnis (Differenz): ' + (settings.temperatureWaterDeactivation - skimmerDeactivationTemperature.t));

                                    if((settings.temperatureWaterDeactivation - skimmerDeactivationTemperature.t) <= 2){
                                        console.log('Solar nicht aktiviert, Wasser ist angenehm warm!');
                                        return;
                                    }
                                }
        
                                if(solarActivationTemperature.t >= settings.temperatureSolarActivation){
                                    console.log('Starte Solar Aktivierung');
                                    let relayShutdown = await asyncCallDevice(settings.shellyIp, '/relay/' + settings.pumpConnectedShellyRelay + '?turn=off');
                                    if(!relayShutdown.ison){
                                        console.log('Pumpe abgeschaltet - warte auf Beruhigung des Wasserkreislaufes.');
                                        Runtime.findOne().where({'relay': settings.pumpConnectedShellyRelay}).sort({ field: 'asc', _id: -1}).exec((err, runtime) => {
                                            runtime.set({
                                                endTime: new Date()
                                            })
                        
                                            let calcHelper = runtime.endTime - runtime.startTime;
                        
                                            runtime.set({
                                                calculatedTime: calcHelper
                                            })
                        
                                            runtime.save();
                                        })
                                        setTimeout(async () => {
                                            console.log('Wasserkreislauf beruhigt, beginne Solar Aktivierung!');
                                            Solar.findOne({isOn: false}).exec(async (err, solar) => {
                                                if(err) {
                                                    console.log(err)
                                                } else if(solar === null) {
                                                    console.log('Kein Eintrag gefunden.');
                                                } else {
                                                    console.log('Beginne Umstellung des 3 Wege Ventils...');
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
                                        }, 4000)
        
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
                                            console.log('3 Wege Ventil erfolgreich umstellt - Solar aktiviert!')
                                            asyncCallDevice(settings.shellyIp, '/relay/' + settings.pumpConnectedShellyRelay + '?turn=on');

                                            let dateHelper = new Date();
                                            let dateHelperToday = dateHelper.toISOString().substr(0,10);
                                            let newRuntime = new Runtime({
                                                relay: settings.pumpConnectedShellyRelay,
                                                date: dateHelperToday,
                                                startTime: new Date()
                                            });
                            
                                            newRuntime.save();

                                            console.log('Pumpe wieder angeschaltet!');
                                        }, 30000)
                                    } else {
                                        console.log('Relay konnte nicht ausgeschaltet werden, Umstellung abgebrochen!');
                                    }
                                }    
                            } else {
                                console.log('Einer der Sensoren ist nicht korrekt ausgewählt oder die Temperaturen nicht eingestellt');
                            }
                        } else {
                            // console.log('Automatische Solarsteuerung ist deaktiviert!');
                        }
                    } else {
                        console.log('Keine Settings gefunden oder kein Shelly angeschlossen!');
                    }
                }
            }

        }        
    })
}, 10000);

 Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
    if (settings != null && settings.raspberryPiConnected) {
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
    }
})

function saveVersion(res) {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
        settings.actualVersion = res.actualVersion;

        settings.save();
    })
}

async function getMachineId() {
    
    var content = fs.readFileSync('/proc/cpuinfo', 'utf8');
    var cont_array = content.split("\n");
	var x = 0; var serial_line = "";
	
	while (x < cont_array.length) {
		serial_line = cont_array[x];
		if (serial_line.startsWith("Serial")) {
			return serial_line.split(":")[1].slice(1);
		}
		x++; 
	}
}

async function getOsInformation(){

    let system = os.type();
    let version = os.release();

    if(system.includes('Windows')){
        var machineId = await uuidv4();
    } else if(system.includes('Darwin')){
        var machineId = await uuidv4();
    } else if(system.includes('Linux') && !system.includes('Warning')){
        var machineId = await getMachineId();
    }
    

    let helper = [];
    helper.push(system, version, machineId);
    
    return new Promise((resolve, reject) => {
        resolve(helper);
    })
}

async function getIpInformation(){
    let externalIp = await publicIp.v4();
    let geo = await geoip.lookup(externalIp);
    let helper = {
        failed: true
    }

    return new Promise((resolve) => {
        resolve(geo);
    })
}

setInterval(function () {

    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
        if (err) {
            //console.log(err);
        } else {
            if (settings.hbDisabled) {
                
            } else {

                if(settings.hbId.toString().length < 15){
                    newInstallationId = await uuidv4();
                } else {
                    newInstallationId = settings.hbId;
                }

                settings.hbId = newInstallationId;

                settings.save((err, newSettings) => {
                    if(err){

                    } else {
                        const body = { versionInfo: newSettings.versionInfo, machineId: newSettings.machineId, hbId: newSettings.hbId, osType: newSettings.osType, osVersion: newSettings.osVersion, country: newSettings.country, region: newSettings.region }

                        fetch('http://49.12.69.199:4000/hb/newHb', {
                            method: 'post',
                            body: JSON.stringify(body),
                            headers: { 'Content-Type': 'application/json' },
                        })
                        .then(res => res.json())
                        .then(body => { saveVersion(body) })
                        .catch(err => err = '');
                    }
                })
            }

        }
    })
}, 3600000);

setTimeout(function(){ 
    // initial sendout
    
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
        if (err) {
            //console.log(err);
        } else {
            if (settings.hbDisabled) {
                
            } else {

                if(settings.hbId.toString().length < 15){
                    newInstallationId = await uuidv4();
                } else {
                    newInstallationId = settings.hbId;
                }

                settings.hbId = newInstallationId;

                settings.save((err, newSettings) => {
                    if(err){

                    } else {
                        const body = { versionInfo: newSettings.versionInfo, machineId: newSettings.machineId, hbId: newSettings.hbId, osType: newSettings.osType, osVersion: newSettings.osVersion, country: newSettings.country, region: newSettings.region }

                        fetch('http://49.12.69.199:4000/hb/newHb', {
                            method: 'post',
                            body: JSON.stringify(body),
                            headers: { 'Content-Type': 'application/json' },
                        })
                        .then(res => res.json())
                        .then(body => { saveVersion(body) })
                        .catch(err => err = '');
                    }
                })
            }

        }
    })
}, 10000);

