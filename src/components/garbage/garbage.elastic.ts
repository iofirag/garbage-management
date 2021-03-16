import { elasticService } from "../../server";
import { IGarbage } from "./garbage.model";


export abstract class GarbageElasticService {

    static async insertGarbage(garbageData: IGarbage) {
        return await this.create(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, garbageData)
    }

    static async updateGarbage(id: string, updateData: IGarbage) {
        return await this.update(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, id, updateData)
    }

    static async searchById(id: string) {
        const queryData = {match: {_id: id}}
        const searchRes: any = await this.search(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, queryData)
        return searchRes.hits.hits
    }

    static async searchAll() {
        const queryData: any = {match_all: {}}
        const searchRes: any = await this.search(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, queryData)
        return searchRes.hits.hits
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
        const searchRes: any = await this.search(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, queryData)
        return searchRes.hits.hits
    }

    static async searchByEmptyDate(emptyDate: number) {
        const queryData: any = {
            match: {
                emptyDate
            }
        }
        const searchRes: any = await this.search(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, queryData)
        return searchRes.hits.hits
    }

    static async deleteById(id: string) {
        return await this.delete(process.env.ELASTIC_INDEX_KEY, process.env.ELASTIC_DOC_TYPE, id)
    }

    static async create(index: string, type: string, body: any) {
        return await elasticService.client.index({
            index,
            type,
            refresh: 'wait_for',
            body,
        })
    }

    static async search(index: string, type: string, queryData: any) {
        return await elasticService.client.search({
            index,
            type,
            body: { 
                query: queryData
            }
        })
    }

    static async update(index: string, type: string, id: string, updateData: any) {
        return await elasticService.client.update({
            index,
            type,
            id,
            refresh: 'wait_for',
            body: {
                doc: updateData,
            }
        })
    }

    static async delete(index: string, type: string, id: string) {
        return await elasticService.client.delete({
            index,
            type,
            refresh: 'wait_for',
            id
        })
    }

    // async function getById(id: string): Promise<any> {
    //     if (!id) throw 'missing id'
    //     return await elasticService.client.get({
    //         index: process.env.ELASTIC_INDEX_KEY,
    //         type: process.env.ELASTIC_DOC_TYPE,
    //         id,
    //     })
    // }
}