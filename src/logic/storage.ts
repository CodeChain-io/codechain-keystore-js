// The MIT License (MIT)

// Copyright (c) 2015 Alex Beregszaszi

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { blake256 } from "codechain-primitives";
import * as crypto from "crypto";
import * as uuid from "uuid";
import { SecretStorage } from "..";
import { PrivateKey } from "../types";
import { ErrorCode, KeystoreError } from "./error";

// copy code from https://github.com/ethereumjs/ethereumjs-wallet/blob/4c7cbfc12e142491eb5acc98e612f079aabe092e/src/index.js#L109
export function encode(
    privateKey: PrivateKey,
    passphrase: string,
    meta: string
): SecretStorage {
    const salt = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const kdf = "pbkdf2";
    const kdfparams = {
        dklen: 32,
        salt: salt.toString("hex"),
        c: 262144,
        prf: "hmac-sha256"
    };
    const derivedKey = crypto.pbkdf2Sync(
        Buffer.from(passphrase),
        salt,
        kdfparams.c,
        kdfparams.dklen,
        "sha256"
    );
    const cipher = crypto.createCipheriv(
        "aes-128-ctr",
        derivedKey.slice(0, 16),
        iv
    );
    const ciphertext: any = Buffer.concat([
        cipher.update(Buffer.from(privateKey, "hex")),
        cipher.final()
    ]);

    const mac = blake256(
        Buffer.concat([
            derivedKey.slice(16, 32),
            Buffer.from(ciphertext, "hex")
        ])
    );

    return {
        crypto: {
            ciphertext: ciphertext.toString("hex"),
            cipherparams: {
                iv: iv.toString("hex")
            },
            cipher: "aes-128-ctr",
            kdf,
            kdfparams,
            mac
        },
        id: uuid.v4({
            random: Array.prototype.slice.call(crypto.randomBytes(16), 0)
        }),
        version: 3,
        meta
    };
}

export function decode(json: SecretStorage, passphrase: string): string {
    const kdfparams = json.crypto.kdfparams;
    const derivedKey = crypto.pbkdf2Sync(
        Buffer.from(passphrase),
        Buffer.from(kdfparams.salt, "hex"),
        kdfparams.c,
        kdfparams.dklen,
        "sha256"
    );
    const ciphertext = Buffer.from(json.crypto.ciphertext, "hex");
    const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]));
    if (mac !== json.crypto.mac) {
        throw new KeystoreError(ErrorCode.DecryptionFailed);
    }
    const decipher = crypto.createDecipheriv(
        json.crypto.cipher,
        derivedKey.slice(0, 16),
        Buffer.from(json.crypto.cipherparams.iv, "hex")
    );
    const privateKey = decipherBuffer(decipher, ciphertext);
    return privateKey.toString("hex");
}

function decipherBuffer(decipher: crypto.Decipher, data: Buffer): Buffer {
    return Buffer.concat([decipher.update(data), decipher.final()]);
}
