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
const General = require('./models/poolcontrol/general');
const Solar = require('./models/poolcontrol/solar');
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

// Setzen der neuen VersionInfo, initiale Anlage der Settings
Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
    if (settings != null) {
        settings.versionInfo = versionInfo.version;

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

function getTemp(id, time) {
    return new Promise((resolve, reject) => {
        ds18b20.temperature(id, (err, value) => {
            resolve({ id, t: value, d: time });
        });
    });
}

// 5 Minuten interval zur Ermittlung der Temperaturen.
// Temperaturen werden nach der Ermittlung in die DB geschrieben.
setInterval(function () {
    let date = + new Date();
    ds18b20.sensors((err, ids) => {
        if (err) {
            console.log(err);
        } else {
            const temps = [];
            for (i = 0; i < ids.length; i += 1) {
                temps.push(getTemp(ids[i], date));
            }

            Promise.all(temps).then(values => {

                for (i = 0; i < temps.length; i++) {

                    let dateHelper = values[i].d;
                    dateHelper = dateHelper.toString();
                    dateHelper = dateHelper.slice(0, -3);
                    dateHelper = parseInt(dateHelper);
                    dateHelper = dateHelper + 7200;
                    dateHelper = dateHelper.toString();
                    dateHelper = dateHelper + '000';
                    dateHelper = parseInt(dateHelper);

                    newTemperature = new Temperature({
                        sensor: values[i].id,
                        temperature: values[i].t,
                        time: dateHelper
                    })

                    newTemperature.save();
                }
            });
        }

    });
}, 300000);

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

}, 10000);

/* Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
    if (settings != null && settings.raspberryPiConnected) {
        gpiop.setup(16, gpio.DIR_IN);
        gpiop.setup(18, gpio.DIR_IN);
    }
}) */

function saveVersion(res) {
    Settings.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(async (err, settings) => {
        settings.actualVersion = res.actualVersion;

        settings.save();
    })
}

async function getMachineId() {
    console.log('ERERRE')
    
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

    console.log('angzelotti')
    let system = os.type();
    let version = os.release();
    console.log('knurz')
    console.log(system);
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

    return new Promise((resolve, reject) => {
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

