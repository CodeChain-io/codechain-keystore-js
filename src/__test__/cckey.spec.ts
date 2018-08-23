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
