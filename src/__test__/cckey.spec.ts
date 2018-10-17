import { CCKey } from "../index";

describe("cckey", () => {
    let cckey: CCKey;

    beforeEach(async () => {
        cckey = await CCKey.create({ dbType: "in-memory" });
    });

    afterEach(async () => {
        cckey.close();
    });

    test("saveLoad", async () => {
        const passphrase = "satoshi";
        const platformKey1 = await cckey.platform.createKey({ passphrase });
        const platformKey2 = await cckey.platform.createKey({ passphrase });
        const assetKey = await cckey.asset.createKey({ passphrase });
        const seedHash = await cckey.hdwseed.createSeed({ passphrase });
        await cckey.setMeta("new meta data");

        const saveData = await cckey.save();
        const newCckey = await CCKey.create({ dbType: "in-memory" });
        await newCckey.load(saveData);

        expect(await newCckey.platform.getKeys()).toEqual([
            platformKey1,
            platformKey2
        ]);
        expect(await newCckey.asset.getKeys()).toEqual([assetKey]);
        expect(await newCckey.hdwseed.getSeedHashes()).toEqual([seedHash]);
        expect(await newCckey.getMeta()).toBe("new meta data");
    });

    test("clear removes key", async () => {
        const createdKey = await cckey.platform.createKey({
            passphrase: "satoshi"
        });
        expect(await cckey.platform.getKeys()).toEqual([createdKey]);
        await cckey.clear();
        expect(await cckey.platform.getKeys()).toEqual([]);
    });
});
