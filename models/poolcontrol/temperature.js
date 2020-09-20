const mongoose = require('mongoose');


const TemperatureSchema = mongoose.Schema({
    sensor: {
        type: String
    },
    temperature: {
        type: Number
    }, 
    time: {
        type: Number
    }
})


//Temperatur extern verfügbar machen
const Temperature = module.exports = mongoose.model('Temperature', TemperatureSchema);