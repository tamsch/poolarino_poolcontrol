const mongoose = require('mongoose');


const SettingsSchema = mongoose.Schema({
    shellyConnected: {
        type: Boolean,
        default: false
    },
    shellyIp: {
        type: String
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
        type: String
    },
    weatherCity:{
        type: String
    },
    weatherAppId:{
        type: String
    },
    weatherCountryCode:{
        type: String
    }
    
})


//Settings extern verfügbar machen
const Settings = module.exports = mongoose.model('Settings', SettingsSchema);