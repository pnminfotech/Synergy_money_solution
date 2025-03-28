const mongoose = require('mongoose');

const UserDataSchema = new mongoose.Schema({
    userId: String,
    name: String,
    mobile: String,
    pan: String,
    taxStatus: String,
    holdingMode: String,
    email: String,
    createdOn: Date,
    clientId: String,
    kyc: String,
    bank: String,
    aof: String,
    fatca: String,
    mandate: String
});

module.exports = mongoose.model('UserData', UserDataSchema);
