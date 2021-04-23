import { App } from "./App";

export const app = App.instance;
app.start();

process.on("SIGINT", async () => {
    await app.stop();
    process.exit(0);
});
