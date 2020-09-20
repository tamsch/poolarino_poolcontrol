const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const ds18b20 = require('ds18b20');
const Temperature = require('./models/poolcontrol/temperature');
const errorHandler = require('express-error-handler');
const General = require('./models/poolcontrol/general');
const Solar = require('./models/poolcontrol/solar');

const ShellyIot = require('shelly-iot');
const Shelly = new ShellyIot({});

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
const users = require('./routes/user/users');
const userRights = require('./routes/user/userRights');
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

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(errorHandler({ dumpExceptions: true, showStack: true })); 
// then, set the listener and do your stuff...

//Importing Authentication
require('./config/passport')(passport);

//Setting up Routes
app.use('/users', users);
app.use('/userRights', userRights);
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
    console.log('Server started on port '+port);
});

function getTemp(id, time) {
    return new Promise((resolve, reject) => {
        ds18b20.temperature(id, (err, value) => {
            resolve({ id, t: value, d: time });
        });
    });
}

// 5 Minuten interval zur Ermittlung der Temperaturen.
// Temperaturen werden nach der Ermittlung in die DB geschrieben.
setInterval(function(){
    let date = + new Date();
    ds18b20.sensors((err, ids) => {
        if(err) {
            console.log(err);
        } else {
            const temps = [];
            for(i = 0; i < ids.length; i += 1) {
                temps.push(getTemp(ids[i], date));
            }
            
            Promise.all(temps).then(values => {
    
                for(i = 0; i < temps.length; i++) {
    
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
setInterval(function(){
    Shelly.callDevice('192.168.178.48', '/status', (error, response, data) => {
        if(error){
            // console.log(error)
        } else {
            Solar.find().exec((err, solar) => {
                if(err){
                    console.log(err);
                } else {
                    if((response.meters[0].power < 400 || response.meters[0].power > 500) && response.relays[0].ison && !solar[0].justSwitched) {
                        Shelly.callDevice('192.168.178.48', '/relay/0?turn=off', (error, response, data) => {
                            console.log('Pumpe notabgeschaltet!');
                            let newGeneral = new General({
                                emergencyShutdown: true,
                                relay: 0,
                                resolved: false
                            })
            
                            newGeneral.save();
                        });
                    }
                }
    
                
            })
        }
        

    }); 
}, 10000);

gpiop.setup(16, gpio.DIR_IN)
gpiop.setup(18, gpio.DIR_IN);

