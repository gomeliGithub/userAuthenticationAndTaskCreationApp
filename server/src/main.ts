import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

import { generateCookieSecret, generateJWT_SecretCode } from './services/sign.generateKeys';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    process.env['JWT_SECRETCODE'] = generateJWT_SecretCode();
    process.env['COOKIE_SECRET'] = generateCookieSecret();

    app.use(cookieParser(process.env['COOKIE_SECRET']));

    app.setGlobalPrefix('/api');

    app.enableShutdownHooks();

    await app.listen(process.env['SERVER_API_PORT'] || 4000);
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