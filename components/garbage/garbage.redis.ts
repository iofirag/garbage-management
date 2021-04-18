import { redisService } from "../..";


export abstract class GarbageRedisService {

    static async getCachedValueByLocationValues(location: {lat: number, lon: number}, distance?: number) {
        const redisKey = this.genRedisLocationKey(location, distance)
        const cacheValue: string = await redisService.getCacheKey(redisKey)
        if (cacheValue)
            return JSON.parse(cacheValue)
        return cacheValue
    }
    
    static async setCachedValueByLocationValues(cacheValue: any, location: {lat: number, lon: number}, distance?: number) {
        const redisKey = this.genRedisLocationKey(location, distance)
        return await redisService.setCacheValue(redisKey, cacheValue, parseInt(process.env.REDIS_CACHE_SECONDS_GARBAGE_LOCATION))
    }

    static async getCachedValueByEmptyDateValue(emptyDate: number) {
        const redisKey = this.genRedisEmptyDateKey(emptyDate)
        const cacheValue: string = await redisService.getCacheKey(redisKey)
        if (cacheValue)
            return JSON.parse(cacheValue)
        return cacheValue
    }

    static async setCachedValueByEmptyDateValue(cacheValue: any, emptyDate: number) {
        const redisKey = this.genRedisEmptyDateKey(emptyDate)
        return await redisService.setCacheValue(redisKey, cacheValue, parseInt(process.env.REDIS_CACHE_SECONDS_GARBAGE_EMPTY_DATE))
    }

    static async removeRedisKeyByLocation(location: {lat: number, lon: number}) {
        const redisKey = this.genRedisLocationKey(location)
        const redisKeys: string[] = await redisService.getCacheKeyListByPrefix(redisKey+'*')
        return redisKeys.forEach(async key => {
            await redisService.deleteCacheKey(key)
        });
    }

    static async removeRedisKeyByEmptyDateValue(emptyDate: number) {
        const redisKey = this.genRedisEmptyDateKey(emptyDate)
        return await redisService.deleteCacheKey(redisKey)
    }

    static genRedisLocationKey(location: {lat: number, lon: number}, distance?: number) {
        let tempKey: string = process.env.REDIS_CACHE_KEY_GARBAGE_LOCATION_DISTANCE.replace('{x}', location.lat.toString()).replace('{y}', location.lon.toString())
        if (distance) {
            tempKey = `${tempKey}_distance_${distance}`
        }
        return tempKey
    }
    
    static genRedisEmptyDateKey(emptyDate: number) {
        return process.env.REDIS_CACHE_KEY_GARBAGE_EMPTY_DATE.replace('{timestamp}', emptyDate.toString())
    }
}