import winston from "winston"


export const LoggerConfig = () => {
    const logger = winston.createLogger({
        transports: [
            new winston.transports.Console(),
            // new winston.transports.File({ filename: 'combined.log' }),
            new winston.transports.File({ filename: 'error.log', level: 'error' }),
        ]
    }) 

    // if (process.env.NODE_ENV !== 'production') {
    //     logger.add(new winston.transports.Console({
    //         format: winston.format.simple(),
    //     }))
    // }
    return logger
}