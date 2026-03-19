import Redis from 'ioredis';

const getRedisClient = () =>{
    if(!process.env.REDIS_URL) {
        throw new Error("REDIS_URL n'est pas définie dans le fichier .env");
    }
    // Important : singleton pour éviter de créer 1000 connexions en serverless
    if (!global.mqRedisClient) {
        global.mqRedisClient = new Redis(process.env.REDIS_URL!, {
            maxRetriesPerRequest: null,
        });

        global.mqRedisClient.on("error", (err) => console.error("Redis Client Error", err));
    }

    return global.mqRedisClient as Redis;
}

export const connection = getRedisClient();

// Pour debug facile (optionnel)
if (process.env.NODE_ENV !== "production") {
    // redis.set("test", "hello from redis").then(() => console.log("Redis OK"));
}