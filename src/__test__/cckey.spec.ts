import { CCKey } from "../index";

let cckey: CCKey;

beforeEach(async () => {
    cckey = await CCKey.create({ useMemoryDB: true });
});

afterEach(async () => {
    cckey.close();
});

test("platform.createKey", async () => {
    const key = await cckey.platform.createKey({ passphrase: "satoshi" });
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
