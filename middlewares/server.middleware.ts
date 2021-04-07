import {Request, Response, NextFunction} from 'express'
import { logger } from '..'

export const ServerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    logger.verbose('req.query:', req.query)
    logger.verbose('req.params:', req.params)
    logger.verbose('req.body', req.body)
    next()
}