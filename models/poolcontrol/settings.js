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
    sensor1: [
        {
            name: String,
            id: String 
        }
    ]
})


//Settings extern verfügbar machen
const Settings = module.exports = mongoose.model('Settings', SettingsSchema);