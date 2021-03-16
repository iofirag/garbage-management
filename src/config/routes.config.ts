import { garbageRouter } from "../components/garbage/garbage.routes"
import {Application, Request, Response} from 'express'
import swaggerUiExpress from "swagger-ui-express"
import YAML from "yamljs"

const swaggerDocument = YAML.load(__dirname + '/../swagger.yaml')


export const RoutesConfig = (app: Application) => {
    app
        .use('/garbage', garbageRouter)
        .use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerDocument))

        .get('/', (req: Request, res: Response) => res.send('<h1>node-ts server is running ;)</h1>'))
}