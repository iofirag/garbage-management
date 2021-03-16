import { Request, Response } from "express"
import { ResponseStatus } from "../../utils/consts"
import { IGarbage } from "./garbage.model"
import { parseLocation } from "../../utils/sharedFunctions"
import { GarbageRedisService } from "./garbage.redis"
import { GarbageElasticService } from "./garbage.elastic"
import { logger } from "../../server"


export module GarbageCtrl {
    export async function create(req: Request, res: Response): Promise<Response> {
        try {
            // Data validation
            const {color, type, location, emptyDate} = req.body
            if (!color || !('type' in req.body) || !location || !emptyDate) return res.json({error: 'missing data'})
            const parsedLocation = parseLocation(location)

            // Cache
            // Empty Redis data related to this garbage location / empty-date values
            await GarbageRedisService.removeRedisKeyByLocation(location)
            await GarbageRedisService.removeRedisKeyByEmptyDateValue(emptyDate)
            
            // Fetch
            const garbageData: IGarbage = {color, type, location: parsedLocation, emptyDate}
            const garbageDoc = await GarbageElasticService.insertGarbage(garbageData)
            return res.status(ResponseStatus.Ok).json(garbageDoc)
        } catch (error) {
            logger.error(error)
            return res.status(ResponseStatus.BadRequest).json({error})
        }
    }

    export async function updateFieldById(req: Request, res: Response): Promise<Response> {
        try {
            // Data validation
            const {id} = req.params
            const {field, value} = req.body
            if (!id || !field || !value) throw 'missing data'

            // Cache
            // Deffer between location / emptyDate requests
            // create key
            // and remove from redis
            switch (field) {
                case 'location':
                    await GarbageRedisService.removeRedisKeyByLocation(value)
                    break;
                case 'emptyDate':
                    await GarbageRedisService.removeRedisKeyByEmptyDateValue(value)
                    break;
                default:
                    console.warn('warn: not cached field')
                    break;
            }

            // Fetch
            const updatedField: any = {[field]: value}
            const queryRes = await GarbageElasticService.updateGarbage(id, updatedField) 
            return res.status(ResponseStatus.Ok).json(queryRes)
        } catch (error) {
            logger.error(error)
            return res.status(ResponseStatus.BadRequest).json({error})
        }
    }

    export async function getById(req: Request, res: Response): Promise<Response> {
        try {
            // Data validation
            const {id} = req.params
            if (!id) {
                throw new Error('missing id')
            }
            const docRes: any = await GarbageElasticService.getById(<string>id)
            return res.status(ResponseStatus.Ok).json(docRes)
        } catch (error) {
            logger.error(error)
            return res.status(ResponseStatus.BadRequest).json({error})
        }
    }

    export async function getAll(req: Request, res: Response): Promise<Response> {
        try {
            const docListRes: any = await GarbageElasticService.getAll()
            return res.status(ResponseStatus.Ok).json(docListRes)
        } catch (error) {
            logger.error(error)
            return res.status(ResponseStatus.BadRequest).json({error})
        }
    }

    export async function getByLocationRange(req: Request, res: Response): Promise<Response> {
        try {
            // Data validations
            const {lat, lon, kmDistance} = req.query
            if (!lat || !lon || !kmDistance) return res.json({error: 'missing data'})

            const location: {lat,lon} = {lat: parseFloat(<any>lat), lon: parseFloat(<any>lon)}
            // Cache
            const cachedRes = await GarbageRedisService.getCachedValueByLocationValues(location, parseFloat(<any>kmDistance))
            if (cachedRes) {
                return res.status(ResponseStatus.Ok).json(cachedRes)
            }
            // Fetch
            const searchListRes: any[] = await GarbageElasticService.searchByLocationAndDistance(location, parseFloat(<any>kmDistance))
            if (searchListRes.length) {
                // Cache
                await GarbageRedisService.setCachedValueByLocationValues(searchListRes, location, parseFloat(<any>kmDistance))
            }
            return res.status(ResponseStatus.Ok).json(searchListRes)
        } catch (error) {
            logger.error(error)
            return res.status(ResponseStatus.BadRequest).json({error})
        }
    }
    
    export async function getByEmptyDate(req: Request, res: Response): Promise<Response> {
        try {
            // Data validations
            const {emptyDate} = req.query
            if (!emptyDate) return res.json({error: 'missing emptyDate'})

            // Cache
            const cachedRes = await GarbageRedisService.getCachedValueByEmptyDateValue(parseInt(<any>emptyDate))
            if (cachedRes) {
                return res.status(ResponseStatus.Ok).json(cachedRes)
            }

            // Fetch
            const searchListRes: any[] = await GarbageElasticService.searchByEmptyDate(parseInt(<any>emptyDate))
            if (searchListRes) {
                // Cache
                await GarbageRedisService.setCachedValueByEmptyDateValue(searchListRes, parseFloat(<any>emptyDate))
            }
            return res.status(ResponseStatus.Ok).json(searchListRes)
        } catch (error) {
            logger.error(error)
            return res.status(ResponseStatus.BadRequest).json({error})
        }
    }
    
    export async function _delete(req: Request, res: Response): Promise<Response> {
        try {
            // Data validations
            const {id} = req.params
            if (!id) return res.json({error: 'missing id'})

            // Cache
            // get garbage location and emptyDate
            // Create location,emptyDate key for redis from garbageId
            // create emptyDate key for redis
            // delete the one that exist
            const docRes = await GarbageElasticService.getById(<string>id)
            await GarbageRedisService.removeRedisKeyByLocation(docRes._source.location)
            await GarbageRedisService.removeRedisKeyByEmptyDateValue(docRes._source.emptyDate)

            // Fetch
            const deleteRes: any = await GarbageElasticService.deleteById(<string>id)
            return res.status(ResponseStatus.Ok).json(deleteRes)
        } catch(error) {
            logger.error(error)
            return res.status(ResponseStatus.BadRequest).json(error)
        }
    }

    export async function createAndFetchTest(req: Request, res: Response): Promise<Response> {
        try {
            // Data validation
            const {color, type, location, emptyDate} = req.body
            if (!color || !('type' in req.body) || !location || !emptyDate) return res.json({error: 'missing data'})
            const parsedLocation = parseLocation(location)
            
            // Fetch
            const garbageData: IGarbage = {color, type, location: parsedLocation, emptyDate}
            const garbageDoc = await GarbageElasticService.insertGarbage(garbageData)

            const docRes: any = await GarbageElasticService.getById(<string>garbageDoc._id)
            return res.status(ResponseStatus.Ok).json(docRes)
        } catch (error) {
            logger.error(error)
            return res.status(ResponseStatus.BadRequest).json({error})
        }
    }
}