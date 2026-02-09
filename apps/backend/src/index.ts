import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { startScheduler } from "./services/scheduler.js";

const app = await buildApp();

if (env.NODE_ENV !== "test") {
  await startScheduler();
}

app
  .listen({ port: env.PORT, host: env.HOST })
  .then(() => {
    app.log.info(`Server running on ${env.HOST}:${env.PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
