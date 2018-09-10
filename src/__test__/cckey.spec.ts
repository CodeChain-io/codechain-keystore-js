import { CCKey } from "../index";
import { keyFromPublicKey } from "../logic/keys";
import { KeyType } from "../model/keys";

let cckey: CCKey;

beforeEach(async () => {
    cckey = await CCKey.create({ useMemoryDB: true });
});

afterEach(async () => {
    cckey.close();
});

test("platform.importRaw", async () => {
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

test("platform.importKey", async () => {
    const secret = {
        crypto: {
            ciphertext:
                "80e5af055f9ecf4a7a851045db47cddd80d9d2554989fa02ca833b5ee2e29b5e1508e0895dad386bc6e7187c4352854900fd9ac1827a8895adb9ce195bc7e009",
            cipherparams: { iv: "0212752ab377bbaf42f660689d7711ec" },
            cipher: "aes-128-ctr",
            kdf: "pbkdf2",
            kdfparams: {
                dklen: 32,
                salt:
                    "b4090e3a7aff620aa18df490feb24d882efc4373e643c91d810d58758f0ff47a",
                c: 262144,
                prf: "hmac-sha256"
            },
            mac:
                "54ba7bfd7f0d527f172c7bc4db08d0e876d17c240cf2a39ce34e8e434efc1543"
        },
        id: "374348c6-3eda-4bec-8365-6966ce884210",
        version: 3
    };
    const key = await cckey.platform.importKey({
        secret,
        passphrase: "satoshi"
    });
    const publicKey =
        "0eb7cad828f1b48c97571ac5fde6add42a7f9285a204291cdc2a03007480dc70639d80c57d80ba6bb02fc2237fec1bb357e405e13b7fb8ed4f947fd8f4900abd";
    expect(key).toBe(keyFromPublicKey(KeyType.Platform, publicKey));
});

test("platform.exportKey", async () => {
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
});

test("platform.exportRawKey", async () => {
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

test("platform.createKey", async () => {
    const key = await cckey.platform.createKey({ passphrase: "satoshi" });
    expect(key).toBeTruthy();
    expect(key.length).toBe(40);
});

test("platform.createKey with an empty passphrase", async () => {
    const key = await cckey.platform.createKey({ passphrase: "" });
    expect(key).toBeTruthy();
    expect(key.length).toBe(40);
});

test("platform.getKeys", async () => {
    let keys = await cckey.platform.getKeys();
    expect(keys.length).toBe(0);

    const key1 = await cckey.platform.createKey({ passphrase: "satoshi" });
    const key2 = await cckey.platform.createKey({ passphrase: "satoshi" });
    keys = await cckey.platform.getKeys();
    expect(keys).toEqual([key1, key2]);
});

test("platform.deleteKey", async () => {
    const key1 = await cckey.platform.createKey({ passphrase: "satoshi" });
    const key2 = await cckey.platform.createKey({ passphrase: "satoshi" });
    const originPublicKey2 = await cckey.platform.getPublicKey({ key: key2 });
    await cckey.platform.deleteKey({ key: key1 });

    const keys = await cckey.platform.getKeys();
    expect(keys).toEqual([key2]);

    const publicKey1 = await cckey.platform.getPublicKey({
        key: key1
    });
    const publicKey2 = await cckey.platform.getPublicKey({
        key: key2
    });
    expect(publicKey1).toEqual(null);
    expect(publicKey2).toEqual(originPublicKey2);
});
