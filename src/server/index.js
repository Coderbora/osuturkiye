const App = require("./App");

const app = new App;
app.start();

process.on("SIGINT", async () => {
    await app.stop();
    process.exit(0);
});
