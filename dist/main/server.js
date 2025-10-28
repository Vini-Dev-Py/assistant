import Fastify from "fastify";
import { prisma } from "src/infrastructure/lib/prisma.js";
const fastify = Fastify({ logger: true });
fastify.get("/", async (request, reply) => {
    return { message: "Hello, Fastify with Prisma!" };
});
fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
});
const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: "0.0.0.0" });
        fastify.log.info(`Server running at http://localhost:3001`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map