import * as crypto from "crypto";

export function pbkdf2Async(
    passphrase: string | Buffer | NodeJS.TypedArray | DataView,
    salt: string | Buffer | NodeJS.TypedArray | DataView,
    iterations: number,
    keylen: number,
    digest: string
): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(
            passphrase,
            salt,
            iterations,
            keylen,
            digest,
            (err, drived) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(drived);
                }
            }
        );
    });
}
