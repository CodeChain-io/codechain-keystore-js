const myCrypto = require("./logic/crypto");
const SDK = require("codechain-sdk");

const privateKey = SDK.SDK.util.generatePrivateKey();
const publicKey = SDK.SDK.util.getPublicFromPrivate(privateKey);
const encrypted = myCrypto.encrypt(privateKey, "password");

const decrypted = myCrypto.decrypt(encrypted, "password");
if (privateKey !== decrypted) {
    throw "Decryption failed";
} else {
    console.log("Decryption success");
}
