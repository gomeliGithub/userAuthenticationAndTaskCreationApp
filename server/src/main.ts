import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

import { generateArgon2Secret, generateCookieSecret, generateJWT_SecretCode } from './services/sign.generateKeys';

import { HttpExceptionFilter } from './filters/http-exception.filter';

import { WinstonService } from './services/winston.service';

async function bootstrap() {
    process.env.JWT_SECRETCODE = generateJWT_SecretCode();
    process.env.COOKIE_SECRET = generateCookieSecret();
    process.env.ARGON2_SECRETCODE = generateArgon2Secret();
    
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser(process.env['COOKIE_SECRET']));

    app.setGlobalPrefix('/api');

    app.enableShutdownHooks();

    const winstonService = app.get(WinstonService);

    app.useGlobalFilters(new HttpExceptionFilter(winstonService));

    await app.listen(process.env.SERVER_API_PORT ?? process.env.PORT as string);
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';

if ( moduleFilename === __filename || moduleFilename.includes('iisnode') ) {
    bootstrap().catch(err => console.error(err));
}


//// package.json ////
// "serve:ssr:userAuthenticationAndTaskCreationApp": "node dist/user-authentication-and-task-creation-app/server/server.mjs"