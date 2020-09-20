const mongoose = require('mongoose');


const RuntimeSchema = mongoose.Schema({
    relay: {
        type: String
    },
    date: {
        type: Date
    }, 
    startTime: {
        type: Number
    },
    endTime: {
        type: Number
    },
    calculatedTime: {
        type: Number
    }
})


//Runtime extern verfügbar machen
const Runtime = module.exports = mongoose.model('Runtime', RuntimeSchema);