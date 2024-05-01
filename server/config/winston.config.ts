import * as winston from 'winston';

const consoleFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const infoAndWarnFilter = winston.format((info, opts) => {
    return info.level === "info" || info.level === "warn" ? info : false;
});

const errorFilter = winston.format((info, opts) => {
    return info.level === "error" ? info : false;
});

const debugFilter = winston.format((info, opts) => {
    return info.level === "debug" ? info : false;
});

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        all: 4,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        debug: "grey",
        all: "white",
    },
};

// Create transports instance
const transports: winston.transport[] = [
    new winston.transports.Console({
        level: "all",
        format:  winston.format.combine(winston.format.colorize(), consoleFormat)
    }),
    new winston.transports.File({
        filename: './server/logs/error.log',
        level: 'error',
        format: winston.format.combine(errorFilter()) // _format
    }),
    new winston.transports.File({
        filename: './server/logs/warning.log',
        level: 'warn',
        format: winston.format.combine(infoAndWarnFilter()) // _format
    }),
    new winston.transports.File({
        filename: './server/logs/info.log',
        level: 'info',
        format: winston.format.combine(infoAndWarnFilter()) // _format
    }),
    new winston.transports.File({
        filename: './server/logs/debug.log',
        level: 'debug',
        format: winston.format.combine(debugFilter()) // _format
    })
];

// Create and export the logger instance
export const logger = winston.createLogger({
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        consoleFormat
    ),
    transports,
    exitOnError: false
});