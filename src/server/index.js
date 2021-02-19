const App = require("./App")();

App.start();

process.on("SIGINT", async () => {
    await App.stop();
    process.exit(0);
});
