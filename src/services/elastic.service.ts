import { Client } from "elasticsearch";
import { logger } from "../server";


export class ElasticService {
    public client: Client

    constructor() {
        this.connect()
        this.init()
    }
    
    private async connect() {
        try {
            const hostList: string[] = JSON.parse(process.env.ELASTIC_URL_LIST)
            this.client = new Client({
                hosts: hostList,
                log: 'trace',
            })
            await this.client.ping({ requestTimeout: 3000 });
            logger.verbose('Elasticsearch client connected.')
        } catch(error) {
            logger.error('Error happend while connecting to elasticsearch', error.message)
        }
	}
    private async init() {
        try {
            await this.client.indices.create({
                index: process.env.ELASTIC_INDEX_KEY
            })
            await this.client.indices.putMapping({
                index: process.env.ELASTIC_INDEX_KEY,
                type: process.env.ELASTIC_MAPPING_TYPE,
                body: GarbageElasticMappingType,
                includeTypeName: true,
            })
            logger.verbose(`create ref index`)
        } catch(error) {
            logger.error(`index: ${process.env.ELASTIC_INDEX_KEY} already exist`)
        }
    }
    public async reset() {
        try {
            await this.client.indices.delete({
                index: process.env.ELASTIC_INDEX_KEY
            })
        } catch (error) {
            console.error(error)
        }
    }
}

export const GarbageElasticMappingType = {
    properties: {
        id: {type: "integer"},
        color: {type: "text"},
        type: {type: "text"},
        location: {type: 'geo_point'},
        emptyDate: {type: "date", format: "epoch_millis"}
    }
}