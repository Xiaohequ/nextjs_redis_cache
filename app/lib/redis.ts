import Redis from 'ioredis';

const redisClient = () =>{
    if(!process.env.REDIS_URL) {
        throw new Error("REDIS_URL n'est pas définie dans le fichier .env");
    }
    return new Redis(process.env.REDIS_URL);
}

// utiliser un singleton pour éviter de multiplier les connexions lors du "Hot Reload" en développement.
const globalForRedis = global as unknown as {redis : Redis};

export const redis = globalForRedis.redis || redisClient();

if(process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;