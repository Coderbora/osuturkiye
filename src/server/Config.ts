import * as fs from "fs";
import * as _ from "lodash";
import { Settings } from 'luxon';

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

        administratorID: "",

        clientId: "",
        clientSecret: "",
        token: ""
    };
    public osu = {
        clientId: "",
        clientSecret: ""
    };
    public mongo = {
        uri: "",

        backupDir: "./data/backups"
    };
    public session = {
        secret: ""
    };
    public misc = {
        cooldownDuration: 24*60*60*100,
        timezone: "Europe/Istanbul"
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

    public load(configPath = "config.json"): void {
        this.parse(fs.readFileSync(configPath).toString(), fs.readFileSync("config.defaults.json").toString());
    }

    public parse(content: string, defaultContent: string): void {
        const contentJSON = JSON.parse(content);
        const defaultContentJSON = JSON.parse(defaultContent);
        const configObj = _.defaultsDeep(contentJSON, defaultContentJSON);

        Object.entries(configObj).forEach(([key, value]) => {
            this[key] = value;
        });

        Settings.defaultZone = this.misc.timezone;
    }
}