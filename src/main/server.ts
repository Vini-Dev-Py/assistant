import Fastify from "fastify";
import { prisma } from "@/infrastructure/database/prisma-client";
import { registerAuthRoutes } from "@/main/routes/auth-routes";
import { registerQuestionRoutes } from "@/main/routes/question-routes";

export async function createServer() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ status: "ok" }));

  await registerAuthRoutes(app);
  await registerQuestionRoutes(app);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}

async function start() {
  try {
    const app = await createServer();
    const port = Number(process.env.PORT ?? 3001);
    const host = process.env.HOST ?? "0.0.0.0";

    await app.listen({ port, host });

    app.log.info(`Server running at http://${host}:${port}`);
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
