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

import * as crypto from "crypto";
import { blake256, getPublicFromPrivate } from "codechain-sdk/lib/utils";
import { AssetTransferAddress } from "codechain-sdk/lib/key/classes";
import { H256 } from "codechain-sdk/lib/core/H256";
import { KeystoreError, ErrorCode } from "./error";

// copy code from https://github.com/ethereumjs/ethereumjs-wallet/blob/4c7cbfc12e142491eb5acc98e612f079aabe092e/src/index.js#L109
export function encrypt(privateKey: string, passphrase: string): string {

    const salt = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const kdf = "pbkdf2";
    const kdfparams = {
        dklen: 32,
        salt: salt.toString("hex"),
        c: 262144,
        prf: "hmac-sha256"
    }
    const derivedKey = crypto.pbkdf2Sync(Buffer.from(passphrase), salt, kdfparams.c, kdfparams.dklen, "sha256");
    const cipher = crypto.createCipheriv("aes-128-ctr", derivedKey.slice(0, 16), iv);
    const ciphertext: any = Buffer.concat([cipher.update(privateKey), cipher.final()])

    const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext, 'hex')]))

    const publicKey = getPublicFromPrivate(privateKey);
    const address = AssetTransferAddress.fromPublicKeyHash(new H256(blake256(publicKey)));

    return JSON.stringify({
        address: address.toString(),
        crypto: {
            ciphertext: ciphertext.toString("hex"),
            cipherparams: {
                iv: iv.toString("hex")
            },
            cipher: "aes-128-ctr",
            kdf,
            kdfparams,
            mac
        }
    });
}

export function decrypt(encryptedText: string, passphrase: string): string {
    const json = JSON.parse(encryptedText);
    const kdfparams = json.crypto.kdfparams;
    const derivedKey = crypto.pbkdf2Sync(Buffer.from(passphrase), Buffer.from(kdfparams.salt, "hex"), kdfparams.c, kdfparams.dklen, "sha256");
    const ciphertext = Buffer.from(json.crypto.ciphertext, "hex");
    const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]));
    if (mac !== json.crypto.mac) {
        throw new KeystoreError(ErrorCode.DecryptionFailed, null);
    }
    const decipher = crypto.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), Buffer.from(json.crypto.cipherparams.iv, "hex"));
    const privateKey = decipherBuffer(decipher, ciphertext);
    return privateKey.toString();
}

function decipherBuffer(decipher: crypto.Decipher, data: Buffer): Buffer {
    return Buffer.concat([decipher.update(data), decipher.final()])
}
