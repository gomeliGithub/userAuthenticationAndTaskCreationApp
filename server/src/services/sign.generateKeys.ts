import * as crypto from 'crypto';

import { __secure_fgpData } from 'types/sign';

export function generateJWT_SecretCode (): string {
    const JWTSecretCode: string = (crypto.createHmac("SHA512", crypto.randomBytes(512))).digest('hex');
    
    return JWTSecretCode;
}

export function generate__secure_fgp (): __secure_fgpData {
    const __secure_fgp: string = crypto.randomBytes(50).toString("hex");
    const __secure_fgpHash: string = (crypto.createHmac("SHA256", __secure_fgp)).digest('hex');

    return {
        __secure_fgp: __secure_fgp,
        __secure_fgpHash: __secure_fgpHash
    }
}

export function generateCookieSecret (): string {
    const cookieSecret: string = crypto.randomBytes(50).toString("hex");

    return cookieSecret;
}