import bodyParser from "body-parser";
import express, { Application } from "express"
import http, { Server } from 'http';
const serviceName = require('./package.json').name;
import { ServerMiddleware } from "./middlewares/server.middleware";
import * as dotenv from 'dotenv'
import { ElasticService } from "./services/elastic.service";
import { RedisService } from "./services/redis.service";
import cors from 'cors'
import * as winston from 'winston'
import { LoggerConfig } from "./config/logger.config";
import fs from 'fs';
import jsyaml from 'js-yaml'
import url from 'url'
import swaggerTools from 'swagger-tools'
import morgan from "morgan";
import os from "os"
// const { Etcd3 } = require('etcd3');
var Etcd = require('node-etcd');
dotenv.config();


export let elasticService: ElasticService
export let redisService: RedisService
export let logger: winston.Logger
const port: number = +process.env.SERVER_PORT || 3088
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
    applyApi();
    process.on('SIGINT', async () => {
        await redisService.reset()
        await elasticService.reset()
    })
}

function applyConfigs(): void {
    logger = LoggerConfig()
}

function loadMiddlewares(): void {
    app.use( cors())
    app.use( bodyParser.json())
    app.use( bodyParser.urlencoded({ extended: true }))
    app.use( ServerMiddleware )
}

function applyServices(): void {
    var etcd = new Etcd();
    etcd.get("configuration/test_json", (err, res) => {
        console.log('data=')
        console.log(res.node.value)
    });
    elasticService = new ElasticService()
    redisService = new RedisService()
}

function applyApi(): void {
    // swaggerRouter configuration
    const options = {
        controllers: './routes',
        useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
    };
    
    // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
    const spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
    const swaggerDoc: any = jsyaml.load(spec);
    
    const parsedURL = url.parse('http://localhost:3088');
    swaggerDoc.host = parsedURL.host || swaggerDoc.host;
    parsedURL.path = parsedURL.path || `/`;
    swaggerDoc.basePath = `${parsedURL.path}${serviceName}${swaggerDoc.basePath}`;

    // Initialize the Swagger middleware
    swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {

        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(middleware.swaggerMetadata());

        // Route validated requests to appropriate controller
        app.use(middleware.swaggerRouter(options));

        app.use(morgan('combined'));

        // Validate Swagger requests
        app.use(middleware.swaggerValidator());

        // CORS!!!! :) And OPTIONS handler
        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, UseCamelCase, x-clientid");
            if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.end();
            }
            else next();
        });

        // Serve the Swagger documents and Swagger UI
        app.use(middleware.swaggerUi({
            apiDocs: `${parsedURL.path}${serviceName}/api-docs`,
            swaggerUi: `/docs`,
        }));

        // Start the server
        server.listen(port, () => {
            logger.log('info', `Your server is listening on http://${swaggerDoc.host}`);
            logger.log('info', `Swagger-ui is available on http://${swaggerDoc.host}/docs`);
            logger.log('info', `Swagger-yaml is available on http://${swaggerDoc.host}/${serviceName}/api-docs`);
        })
    });
}