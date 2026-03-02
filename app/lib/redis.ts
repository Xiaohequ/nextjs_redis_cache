import Redis from 'ioredis';

const getRedisClient = () =>{
    if(!process.env.REDIS_URL) {
        throw new Error("REDIS_URL n'est pas définie dans le fichier .env");
    }
    // Important : singleton pour éviter de créer 1000 connexions en serverless
    if (!global.redisClient) {
        global.redisClient = new Redis(process.env.REDIS_URL!, {
            // options recommandées pour la prod
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                return Math.min(times * 50, 2000); // backoff exponentiel
            },
            // tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
            // lazyConnect: true, // optionnel
        });

        global.redisClient.on("error", (err) => console.error("Redis Client Error", err));
    }

    return global.redisClient as Redis;
}

export const redis = getRedisClient();

// Pour debug facile (optionnel)
if (process.env.NODE_ENV !== "production") {
    // redis.set("test", "hello from redis").then(() => console.log("Redis OK"));
}