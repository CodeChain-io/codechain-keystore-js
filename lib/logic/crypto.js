"use strict";
// The MIT License (MIT)
Object.defineProperty(exports, "__esModule", { value: true });
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
var crypto = require("crypto");
var utils_1 = require("codechain-sdk/lib/utils");
var error_1 = require("./error");
// copy code from https://github.com/ethereumjs/ethereumjs-wallet/blob/4c7cbfc12e142491eb5acc98e612f079aabe092e/src/index.js#L109
function encrypt(privateKey, passphrase) {
    var salt = crypto.randomBytes(32);
    var iv = crypto.randomBytes(16);
    var kdf = "pbkdf2";
    var kdfparams = {
        dklen: 32,
        salt: salt.toString("hex"),
        c: 262144,
        prf: "hmac-sha256"
    };
    var derivedKey = crypto.pbkdf2Sync(Buffer.from(passphrase), salt, kdfparams.c, kdfparams.dklen, "sha256");
    var cipher = crypto.createCipheriv("aes-128-ctr", derivedKey.slice(0, 16), iv);
    var ciphertext = Buffer.concat([cipher.update(privateKey), cipher.final()]);
    var mac = utils_1.blake256(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext, 'hex')]));
    return JSON.stringify({
        crypto: {
            ciphertext: ciphertext.toString("hex"),
            cipherparams: {
                iv: iv.toString("hex")
            },
            cipher: "aes-128-ctr",
            kdf: kdf,
            kdfparams: kdfparams,
            mac: mac
        }
    });
}
exports.encrypt = encrypt;
function decrypt(encryptedText, passphrase) {
    var json = JSON.parse(encryptedText);
    var kdfparams = json.crypto.kdfparams;
    var derivedKey = crypto.pbkdf2Sync(Buffer.from(passphrase), Buffer.from(kdfparams.salt, "hex"), kdfparams.c, kdfparams.dklen, "sha256");
    var ciphertext = Buffer.from(json.crypto.ciphertext, "hex");
    var mac = utils_1.blake256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]));
    if (mac !== json.crypto.mac) {
        throw new error_1.KeystoreError(error_1.ErrorCode.DecryptionFailed, null);
    }
    var decipher = crypto.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), Buffer.from(json.crypto.cipherparams.iv, "hex"));
    var privateKey = decipherBuffer(decipher, ciphertext);
    return privateKey.toString();
}
exports.decrypt = decrypt;
function decipherBuffer(decipher, data) {
    return Buffer.concat([decipher.update(data), decipher.final()]);
}
//# sourceMappingURL=crypto.js.map