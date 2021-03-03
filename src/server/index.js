const App = require("./App")();

(async () => { 
    await App.start();

    process.on("SIGINT", async () => {
        await App.stop();
        process.exit(0);
    }); })();
