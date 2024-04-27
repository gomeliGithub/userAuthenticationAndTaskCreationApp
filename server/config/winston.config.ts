import * as winston from 'winston';

// Create transports instance
const transports: winston.transport[] = [
    new winston.transports.Console({
        handleExceptions: true,
        stderrLevels: [ 'error', 'warn', 'info', 'http', 'debug' ],
        consoleWarnLevels: [ 'warn', 'debug' ],
        format: winston.format.combine(
            // Add a timestamp to the console logs
            winston.format.timestamp(),
            // Add colors to you logs
            winston.format.colorize(),
            // What the details you need as logs
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
                return `${ timestamp } [${ context }] ${ level }: ${ message }${ trace ? `\n${trace}` : '' }`;
            }),
        )
    }),
    new winston.transports.Http({
        host: process.env.SERVER_DOMAIN,
        port: parseInt(process.env.SERVER_API_PORT as string, 10), // but this defaults to port 80
        path: "/api/v1/log",
        auth: undefined,
        ssl: false,
        batch: false,
        batchInterval: 5000,
        batchCount: 10
    }),
    new winston.transports.File({
        filename: './logs/error.log',
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        )
    }),
    new winston.transports.File({
        filename: './logs/warning.log',
        level: 'warn',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        )
    }),
    new winston.transports.File({
        filename: './logs/combined.log',
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        )
    }),
    new winston.transports.File({
        filename: './logs/http.log',
        level: 'http',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        )
    }),
    new winston.transports.File({
        filename: './logs/debug.log',
        level: 'debug',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        )
    })
];

// Create and export the logger instance
export const logger = winston.createLogger({
    transports,
    exceptionHandlers: [
        new winston.transports.File({ filename: './logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: './logs/rejections.log' })
    ],
    exitOnError: false
});