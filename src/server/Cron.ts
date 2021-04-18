import { CronJob } from "cron";
import { Logger } from "./Logger";
import RefreshAllUserData from "./scripts/RefreshAllUserData";

export class Cron {

    tasks: Array<CronJob> = [];

    logger = Logger.get("cron")

    init() {
        this.tasks.push(new CronJob("0 0 0 * * *" , async () => { // every day at midnight
            try {
                this.logger.info("Executing daily user data refresh task!");
                await new RefreshAllUserData().run();
                this.logger.info("Successfully completed the refresh task!");
            } catch(err) {
                this.logger.error("An error occured while executing refresh task!", { err });
            }
        }))

        for (const task of this.tasks) 
            task.start();
    }

    stop() {
        this.tasks.forEach((task) => task.stop());
    }

}