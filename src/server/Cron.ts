import { CronJob } from "cron";
import { DateTime } from "luxon";
import { Logger } from "./Logger";
import RefreshAllUserData from "./scripts/RefreshAllUserData";
import BackupDatabase from "./scripts/BackupDatabase";

import { IScript } from "./models/IScript";
export class Cron {

    tasks: Array<CronJob> = [];

    logger = Logger.get("cron")

    init(): void {
        this.tasks.push(new CronJob("0 0 0 * * *" , async () => { // every day at midnight
            try {
                this.logger.info("Executing daily user data refresh task!");
                await new RefreshAllUserData().run();
                this.logger.info("Successfully completed the refresh task!");
            } catch(err) {
                this.logger.error("An error occured while executing refresh task!", { err });
            }
        }));

        this.tasks.push(new CronJob("0 0 2 * * 1" , async () => { // every monday at 2 AM
            try {
                this.logger.info("Executing weekly database backup task!");
                await new BackupDatabase().run();
                this.logger.info("Successfully completed the database backup task!");
            } catch(err) {
                this.logger.error("An error occured while executing database backup task!", { err });
            }
        }))

        for (const task of this.tasks) 
            task.start();
    }

    runScriptManually(scriptName: string): string {
        let module: IScript;
        const runDate = DateTime.now().plus({ seconds: 30 });
        try {
            /* eslint-disable */ // for importing scripts
            module = (new (require("./scripts/" + scriptName + ".js").default)() as IScript);
            /* eslint-enable */
            const manualJob = new CronJob(runDate.toJSDate(), async () => {
                await module.run();
                manualJob.stop();
                this.tasks.splice(this.tasks.indexOf(manualJob), 1);
            })
            this.tasks.push(manualJob);
            manualJob.start();
            return "Scheduled to run script `" + scriptName + "` at " + runDate.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET);
        } catch(error) {
            this.logger.error("Failed to import module " + scriptName, { error });
            throw error;
        }
    }

    stop(): void {
        this.tasks.forEach((task) => task.stop());
    }

}