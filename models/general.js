const mongoose = require('mongoose');


const GeneralSchema = mongoose.Schema({
    emergencyShutdown: {
        type: Boolean
    },
    relay: {
        type: Number
    },
    resolved: {
        type: Boolean
    }
})


//General extern verfügbar machen
const General = module.exports = mongoose.model('General', GeneralSchema);