import { CCKey } from "../index";
import { keyFromPublicKey } from "../model/keys";
import { KeyType } from "../model/keytypes";

describe("platform", () => {
    let cckey: CCKey;
    beforeEach(async () => {
        cckey = await CCKey.create({ dbType: "in-memory" });
    });

    afterEach(async () => {
        cckey.close();
    });

    test("importRaw", async () => {
        const privateKey =
            "a05f81608217738d99da8fd227897b87e8890d3c9159b559c7c8bbd408e5fb6e";
        const key = await cckey.platform.importRaw({
            privateKey,
            passphrase: "satoshi"
        });
        const publicKey =
            "0eb7cad828f1b48c97571ac5fde6add42a7f9285a204291cdc2a03007480dc70639d80c57d80ba6bb02fc2237fec1bb357e405e13b7fb8ed4f947fd8f4900abd";
        expect(key).toBe(keyFromPublicKey(KeyType.Platform, publicKey));
    });

    test("importKey", async () => {
        const secret = {
            crypto: {
                ciphertext:
                    "4f870523e834408c08ace7df91671a2b603761f0dbbfd93fa31a5dcda9947515",
                cipherparams: { iv: "c47d44a36824ee5207cf435795e7e583" },
                cipher: "aes-128-ctr",
                kdf: "pbkdf2",
                kdfparams: {
                    dklen: 32,
                    salt:
                        "d187b8eaacbed337261728f33d1dbd51f9532dda82d8c7b8abe4860d2505c43f",
                    c: 262144,
                    prf: "hmac-sha256"
                },
                mac:
                    "d75a7c45d4c2c4fa4a7b81319e94e27848b188cfed949524f9e6f3b83c66d518"
            },
            id: "31ea5ae9-dad4-4a5a-9a8e-9a9de80d619e",
            version: 3,
            meta: "some meta info"
        };
        const key = await cckey.platform.importKey({
            secret,
            passphrase: "satoshi"
        });
        const publicKey =
            "0eb7cad828f1b48c97571ac5fde6add42a7f9285a204291cdc2a03007480dc70639d80c57d80ba6bb02fc2237fec1bb357e405e13b7fb8ed4f947fd8f4900abd";
        expect(key).toBe(keyFromPublicKey(KeyType.Platform, publicKey));
    });

    test("exportKey", async () => {
        const privateKey =
            "a05f81608217738d99da8fd227897b87e8890d3c9159b559c7c8bbd408e5fb6e";
        const key = await cckey.platform.importRaw({
            privateKey,
            passphrase: "satoshi"
        });
        const storage = await cckey.platform.exportKey({
            key,
            passphrase: "satoshi"
        });
        expect(storage).toHaveProperty("crypto");
        expect(storage.crypto).toHaveProperty("cipher");
        expect(storage.crypto).toHaveProperty("cipherparams");
        expect(storage.crypto).toHaveProperty("ciphertext");
        expect(storage.crypto).toHaveProperty("kdf");
        expect(storage.crypto).toHaveProperty("kdfparams");
        expect(storage.crypto).toHaveProperty("mac");
        expect(storage).toHaveProperty("meta");
    });

    test("importKeyWithMeta", async () => {
        const secret = {
            crypto: {
                ciphertext:
                    "4f870523e834408c08ace7df91671a2b603761f0dbbfd93fa31a5dcda9947515",
                cipherparams: { iv: "c47d44a36824ee5207cf435795e7e583" },
                cipher: "aes-128-ctr",
                kdf: "pbkdf2",
                kdfparams: {
                    dklen: 32,
                    salt:
                        "d187b8eaacbed337261728f33d1dbd51f9532dda82d8c7b8abe4860d2505c43f",
                    c: 262144,
                    prf: "hmac-sha256"
                },
                mac:
                    "d75a7c45d4c2c4fa4a7b81319e94e27848b188cfed949524f9e6f3b83c66d518"
            },
            id: "31ea5ae9-dad4-4a5a-9a8e-9a9de80d619e",
            version: 3,
            meta: "some meta info"
        };
        const key = await cckey.platform.importKey({
            secret,
            passphrase: "satoshi"
        });
        const storage = await cckey.platform.exportKey({
            key,
            passphrase: "satoshi"
        });
        expect(storage.meta).toBe("some meta info");
    });

    test("exportRawKey", async () => {
        const privateKey =
            "a05f81608217738d99da8fd227897b87e8890d3c9159b559c7c8bbd408e5fb6e";
        const key = await cckey.platform.importRaw({
            privateKey,
            passphrase: "satoshi"
        });
        const exportedPrivateKey = await cckey.platform.exportRawKey({
            key,
            passphrase: "satoshi"
        });
        expect(exportedPrivateKey).toBe(privateKey);
    });

    test("createKey", async () => {
        const key = await cckey.platform.createKey({ passphrase: "satoshi" });
        expect(key).toBeTruthy();
        expect(key.length).toBe(40);
    });

    test("createKey with an empty passphrase", async () => {
        const key = await cckey.platform.createKey({ passphrase: "" });
        expect(key).toBeTruthy();
        expect(key.length).toBe(40);
    });

    test("getKeys", async () => {
        let keys = await cckey.platform.getKeys();
        expect(keys.length).toBe(0);

        const key1 = await cckey.platform.createKey({ passphrase: "satoshi" });
        const key2 = await cckey.platform.createKey({ passphrase: "satoshi" });
        keys = await cckey.platform.getKeys();
        expect(keys).toEqual([key1, key2]);
    });

    test("deleteKey", async () => {
        const passphrase = "satoshi";
        const key1 = await cckey.platform.createKey({ passphrase });
        const key2 = await cckey.platform.createKey({ passphrase });
        const originPublicKey2 = await cckey.platform.getPublicKey({
            key: key2,
            passphrase
        });
        await cckey.platform.deleteKey({ key: key1 });

        const keys = await cckey.platform.getKeys();
        expect(keys).toEqual([key2]);

        const publicKey1 = await cckey.platform.getPublicKey({
            key: key1,
            passphrase
        });
        const publicKey2 = await cckey.platform.getPublicKey({
            key: key2,
            passphrase
        });
        expect(publicKey1).toEqual(null);
        expect(publicKey2).toEqual(originPublicKey2);
    });

    test("exportAndImport", async () => {
        const createdKey = await cckey.platform.createKey({
            passphrase: "satoshi"
        });
        expect(createdKey).toBeTruthy();
        expect(createdKey.length).toBe(40);

        const secret = await cckey.platform.exportKey({
            key: createdKey,
            passphrase: "satoshi"
        });
        expect(secret).toHaveProperty("crypto");
        expect(secret.crypto).toHaveProperty("cipher");
        expect(secret.crypto).toHaveProperty("cipherparams");
        expect(secret.crypto).toHaveProperty("ciphertext");
        expect(secret.crypto).toHaveProperty("kdf");
        expect(secret.crypto).toHaveProperty("kdfparams");
        expect(secret.crypto).toHaveProperty("mac");

        const importedKey = await cckey.platform.importKey({
            secret,
            passphrase: "satoshi"
        });
        expect(createdKey).toBe(importedKey);
    });

    test("createWithoutMeta", async () => {
        const createdKey = await cckey.platform.createKey({
            passphrase: "satoshi"
        });
        const meta = await cckey.platform.getMeta({ key: createdKey });
        expect(meta).toBe("{}");
    });

    test("createWithMeta", async () => {
        const createdKey = await cckey.platform.createKey({
            passphrase: "satoshi",
            meta: '{"name": "test"}'
        });
        const meta = await cckey.platform.getMeta({ key: createdKey });
        expect(meta).toBe('{"name": "test"}');
    });

    test("clear removes key", async () => {
        const createdKey = await cckey.platform.createKey({
            passphrase: "satoshi"
        });
        expect(await cckey.platform.getKeys()).toEqual([createdKey]);
        await cckey.platform.clear();
        expect(await cckey.platform.getKeys()).toEqual([]);
    });
});
