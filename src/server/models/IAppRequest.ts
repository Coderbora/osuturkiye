import * as express from "express";
import { IUser } from "./User";

export interface IAppRequest extends express.Request {
    api: boolean;
    user?: IUser;
}
