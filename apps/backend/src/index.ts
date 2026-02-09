import { buildApp } from "./app";
import { env } from "./config/env";
import { startScheduler } from "./services/scheduler";

const app = await buildApp();

if (env.NODE_ENV !== "test") {
  startScheduler();
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
