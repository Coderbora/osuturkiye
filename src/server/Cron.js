const { CronJob } = require("cron");
const Logger = require("./Logger.js");
const RefreshAllUserData = require("./scripts/RefreshAllUserData.js")

let mInstance = null;

class Cron {

    tasks = [];

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
        this.tasks.forEach((job) => job.stop());
    }

}

module.exports = () => {
    if(mInstance == null)
        mInstance = new Cron();
    return mInstance;
  }