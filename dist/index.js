import { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();
// Basic route
fastify.get("/", async (request, reply) => {
    return { message: "Hello, Fastify with Prisma!" };
});
// Route to fetch users
fastify.get("/users", async (request, reply) => {
    const users = await prisma.user.findMany();
    return users;
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
//# sourceMappingURL=index.js.map