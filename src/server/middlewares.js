const mongoose = require('mongoose');
const { ErrorCode } = require('./models/ErrorCodes.js');

const isAuthenticated = (req, res, next) => {
    if(!req.user)
        throw ErrorCode.NOT_AUTHENTICATED;
    next();
}

const isDatabaseAvailable = (req, res, next) => {
    if(mongoose.connection.readyState !== 1)
        throw ErrorCode.TEMPORARILY_UNAVAILABLE;
    next();
}

module.exports = {isAuthenticated, isDatabaseAvailable}