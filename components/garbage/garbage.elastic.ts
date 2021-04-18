import { elasticService } from "../..";
import { IGarbage } from "./garbage.model";


export abstract class GarbageElasticService {

    static async insertGarbage(garbageData: IGarbage) {
        return await elasticService.create(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, garbageData)
    }

    static async updateGarbage(id: string, updateData: IGarbage) {
        return await elasticService.update(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, id, updateData)
    }

    static async getById(id: string) {
        const queryData: any = {match: {_id: id}}
        return await elasticService.getByCondition(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, queryData)
    }

    static async getAll() {
        const queryData: any = {match_all: {}}
        return await elasticService.getByCondition(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, queryData)
    }

    static async searchByLocationAndDistance(location: {lat: number, lon: number}, kmDistance: number) {
        const queryData: any = {
            geo_distance: {
                location
            }
        }
        if (kmDistance) {
            queryData.geo_distance.distance = `${kmDistance}km`
        }
        const searchRes: any = await elasticService.search(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, queryData)
        return searchRes.hits.hits
    }

    static async searchByEmptyDate(emptyDate: number) {
        const queryData: any = {
            match: {
                emptyDate
            }
        }
        const searchRes: any = await elasticService.search(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, queryData)
        return searchRes.hits.hits
    }

    static async deleteById(id: string) {
        return await elasticService.delete(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, id)
    }
}