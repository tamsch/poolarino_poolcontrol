const mongoose = require('mongoose');


const SettingsSchema = mongoose.Schema({
    shellyConnected: {
        type: Boolean,
        default: false
    },
    shellyIp: {
        type: String,
        default: '192.168.178.188'
    },
    raspberryPiConnected: {
        type: Boolean,
        default: false
    },
    sensor1name:{
        type: String,
        default: '1'
    },
    sensor1id:{
        type: String,
        default: '11'
    },
    sensor2name:{
        type: String,
        default: '2'
    },
    sensor2id:{
        type: String,
        default: '22'
    },
    sensor3name:{
        type: String,
        default: '3'
    },
    sensor3id:{
        type: String,
        default: '33'
    },
    sensor4name:{
        type: String,
        default: '4'
    },
    sensor4id:{
        type: String,
        default: '44'
    },
    sensor5name:{
        type: String,
        default: '5'
    },
    sensor5id:{
        type: String,
        default: '55'
    },
    sensor6name:{
        type: String,
        default: '6'
    },
    sensor6id:{
        type: String,
        default: '66'
    },
    sensor7name:{
        type: String,
        default: '7'
    },
    sensor7id:{
        type: String,
        default: '77'
    },
    sensor8name:{
        type: String,
        default: '8'
    },
    sensor8id:{
        type: String,
        default: '88'
    },
    weatherName:{
        type: String,
        default: 'Mein Wetter'
    },
    weatherCity:{
        type: String,
        default: 'Bremen'
    },
    weatherAppId:{
        type: String,
        default: 'fb6b2394qq52acs23d0dd23dab3fb6de'
    },
    weatherCountryCode:{
        type: String,
        default: 'de'
    },
    versionInfo:{
        type: Number,
        default: 0.1
    },
    actualVersion:{
        type: Number,
        default: 0.1
    },
    cpuSerial:{
        type: String,
        default: '000000000'
    },
    hbId:{
        type: String,
        default: '1234567890'
    },
    hbDisabled:{
        type: Boolean,
        default: false
    }
    
})


//Settings extern verfügbar machen
const Settings = module.exports = mongoose.model('Settings', SettingsSchema);