import IORedis from 'ioredis'
import { logger } from '../server'


export class RedisService {
    public client: IORedis.Redis

    constructor() {
        this.connect()
    }

    private async connect() {
        try {
            this.client = new IORedis()
            this.client.on('error', (error) => {
                console.error(error)
            })
        } catch(error) {
            logger.error('Error happend while connecting to Redis', error.message)
        }
    }

    public async reset() {
        try {
            const redisKeys: string[] = await this.client.keys(process.env.REDIS_CACHE_KEY_GARBAGE+'*')
            redisKeys.forEach(async key => {
                await this.client.del(key)
            });
        } catch (error) {
            console.error(error)
        }
    }
}