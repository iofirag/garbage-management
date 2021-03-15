import bodyParser from "body-parser";
import express, { Application } from "express"
import os from "os"
import http, { Server } from 'http';
import { RoutesConfig } from "./config/routes.config";
import { ServerMiddleware } from "./middlewares/server.middleware";
import * as dotenv from 'dotenv'
import { ElasticService } from "./services/elastic.service";
import { RedisService } from "./services/redis.service";
import cors from 'cors'
import * as winston from 'winston'
import { LoggerConfig } from "./config/logger.config";
dotenv.config();


export let elasticService: ElasticService
export let redisService: RedisService
export let logger: winston.Logger
const port: number = +process.env.SERVER_PORT || 8810
const app: Application = express()
const server: Server = createServer()
listen()


function createServer(): Server {
    return http.createServer(app)
}

function listen(): void {
    loadMiddlewares();
    applyConfigs();
    applyServices();
    process.on('SIGINT', async () => {
        await redisService.reset()
        await elasticService.reset()
    })
    server.listen(port, () => {
        logger.verbose(`our app server is running on http://${os.hostname()}:${port}`)
    })
}

function applyConfigs(): void {
    RoutesConfig(app)
    logger = LoggerConfig()
}

function applyServices(): void {
    // connect to db
    elasticService = new ElasticService()
    redisService = new RedisService()
}

function loadMiddlewares(): void {
    app.use( cors())
    app.use( bodyParser.json())
    app.use( bodyParser.urlencoded({ extended: true }))
    app.use( ServerMiddleware )
}