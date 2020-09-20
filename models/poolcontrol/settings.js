const mongoose = require('mongoose');


const SettingsSchema = mongoose.Schema({
    shellyConnected: {
        type: Boolean
    }
})


//User extern verfügbar machen
const Settings = module.exports = mongoose.model('Settings', SettingsSchema);