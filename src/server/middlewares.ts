import { Handler } from "express";
import mongoose from 'mongoose';
import { ErrorCode } from "./models/ErrorCodes";

const isAuthenticated: Handler = (req, res, next) => {
    if(!req.user)
        throw ErrorCode.NOT_AUTHENTICATED;
    next();
}

const isDatabaseAvailable: Handler = (req, res, next) => {
    if(mongoose.connection.readyState !== 1)
        throw ErrorCode.TEMPORARILY_UNAVAILABLE;
    next();
}

export {isAuthenticated, isDatabaseAvailable}