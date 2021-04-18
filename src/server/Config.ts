import * as fs from "fs";
import * as _ from "lodash";
import { Logger } from "./Logger";

export class Config {
    public http = {
        host: "",
        port: 5000,
        publicUrl: ""
    };
    public https = {
        enable: true,
        host: "",
        port: 5443,
        publicUrl: "",

        privateKeyPath: "",
        certificatePath: ""
    };
    public discord = {
        guildID: "",
        roles: {
            verifiedRole: "",
            groupRoles: {
                gmt: "",
                bng: "",
                nat: "",
                alumni: ""
            },
            playModeRoles: {
                osu: "",
                mania: "",
                taiko: "",
                fruits: ""
            },
            rankedMapper: ""
        },

        logChannel: "",

        clientId: "",
        clientSecret: "",
        token: ""
    };
    public osu = {
        clientId: "",
        clientSecret: ""
    };
    public mongo = {
        uri: ""
    };
    public session = {
        secret: ""
    };
    public level_colors = {
        info: "17A2B8",
        notice: "17A2B8",
        warn: "FFC107",
        error: "DC3545"
    };

    constructor() {
        this.load();
    }

    public load(configPath: string = "config.json") {
        this.parse(fs.readFileSync(configPath).toString(), fs.readFileSync("config.defaults.json").toString());
    }

    public parse(content: string, defaultContent: string) {
        const contentJSON = JSON.parse(content);
        const defaultContentJSON = JSON.parse(defaultContent);
        const configObj = _.defaultsDeep(contentJSON, defaultContentJSON);

        Object.entries(configObj).forEach(([key, value]) => {
            this[key] = value;
        });
    }
}