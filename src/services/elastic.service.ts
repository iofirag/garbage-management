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
                maxRetries: 5,
                requestTimeout: 60000,
            })
            logger.verbose('Elasticsearch client connected.')
        } catch(error) {
            logger.error('Error happend while connecting to elasticsearch', error.message)
        }
	}
    private async init() {
        try {
            // Create index & mapping types
            await this.client.indices.create({
                index: process.env.ELASTIC_INDEX_KEY,
                body: {
                    mappings: {
                        properties: GarbageElasticMappingType,
                    },
                    settings: {
                        final_pipeline: process.env.ELASTIC_INGEST_PIPELINE_KEY
                    }
                }
            })
            logger.verbose(`success create ${process.env.ELASTIC_INDEX_KEY} index`)
        } catch(error) {
            logger.verbose(`error: create index, ${error}`)
            logger.error(`error: index ${process.env.ELASTIC_INDEX_KEY} already exist`)
        }
        try {
            // Create pipeline
            await this.client.ingest.putPipeline({
                id: process.env.ELASTIC_INGEST_PIPELINE_KEY,
                body: {
                    description: `Creates ${process.env.ELASTIC_INGEST_PIPELINE_KEY} pipeline when a document is initially indexed`,
                    processors: [{
                        set: {
                            field: '_source.timestamp',
                            value: '{{_ingest.timestamp}}'
                        }
                    }]
                }
            })
            logger.verbose(`success create pipeline`)
        } catch(error) {
            logger.error(`pipeline: ${process.env.ELASTIC_INGEST_PIPELINE_KEY} already exist`)
        }
    }
    public async reset() {
        try {
            // Delete pipeline
            this.client.ingest.deletePipeline({ id: process.env.ELASTIC_INGEST_PIPELINE_KEY })
            logger.verbose(`delete elastic pipeline`)
        } catch (error) {
            logger.error(error)
        }
        try {
            // Delete index
            this.client.indices.delete({ index: process.env.ELASTIC_INDEX_KEY })
            logger.verbose(`delete elastic index`)
        } catch (error) {
            logger.error(error)
        }
    }
}

export const GarbageElasticMappingType = {
    id: {type: "integer"},
    color: {type: "keyword"},
    type: {type: "keyword"},
    location: {type: 'geo_point'},
    emptyDate: {type: "date", format: "epoch_millis"},
    timestamp: {type: "date", /*format: "epoch_millis"*/},
}