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
        await cckey.setMeta("new meta data");

        const saveData = await cckey.save();
        const newCckey = await CCKey.create({ dbType: "in-memory" });
        await newCckey.load(saveData);

        expect(await cckey.platform.getKeys()).toEqual([
            platformKey1,
            platformKey2
        ]);
        expect(await cckey.asset.getKeys()).toEqual([assetKey]);
        expect(await newCckey.getMeta()).toBe("new meta data");
    });
});
