import * as crypto from 'crypto';

import { __secure_fgpData } from 'types/sign';
// Генерация sha512 хеша случайного набора данных для 'секретного кода' подписи токенов
export function generateJWT_SecretCode (): string {
    const JWTSecretCode: string = ( crypto.createHmac("SHA512", crypto.randomBytes(512)) ).digest('hex');
    
    return JWTSecretCode;
}
// Генерация sha256 хеша случайной строки для 'фингерпинта' клиента
export function generate__secure_fgp (): __secure_fgpData {
    const __secure_fgp: string = crypto.randomBytes(50).toString("hex");
    const __secure_fgpHash: string = ( crypto.createHmac("SHA256", __secure_fgp) ).digest('hex');

    return {
        __secure_fgp: __secure_fgp,
        __secure_fgpHash: __secure_fgpHash
    }
}
// Генерация случайной строки для 'секрета' подписи 'куки'
export function generateCookieSecret (): string {
    const cookieSecret: string = crypto.randomBytes(50).toString("hex");

    return cookieSecret;
}
// Генерация случайной строки для 'секрета' argon2
export function generateArgon2Secret (): string {
    const argon2Secret: string = crypto.randomBytes(60).toString("hex");

    return argon2Secret;
}