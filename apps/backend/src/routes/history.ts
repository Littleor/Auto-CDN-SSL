import { FastifyPluginAsync } from "fastify";
import { listHistoryForUser } from "../services/historyService.js";

const historyRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request: any) => {
    return listHistoryForUser(request.user.sub);
  });
};

export default historyRoutes;
