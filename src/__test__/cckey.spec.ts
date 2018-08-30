import { CCKey } from "../index";

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
    expect(key).toBe(
        "0eb7cad828f1b48c97571ac5fde6add42a7f9285a204291cdc2a03007480dc70639d80c57d80ba6bb02fc2237fec1bb357e405e13b7fb8ed4f947fd8f4900abd"
    );
});

test("platform.createKey", async () => {
    const key = await cckey.platform.createKey({ passphrase: "satoshi" });
    expect(key).toBeTruthy();
    expect(key.length).toBe(128);
});

test("platform.createKey with an empty passphrase", async () => {
    const key = await cckey.platform.createKey({ passphrase: "" });
    expect(key).toBeTruthy();
    expect(key.length).toBe(128);
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
    await cckey.platform.deleteKey({ publicKey: key1 });

    const keys = await cckey.platform.getKeys();
    expect(keys).toEqual([key2]);
});

test("mapping.add", async () => {
    await cckey.mapping.add({ key: "satoshi", value: "nakamoto" });
    const value = await cckey.mapping.get({ key: "satoshi" });

    expect(value).toEqual("nakamoto");
});
