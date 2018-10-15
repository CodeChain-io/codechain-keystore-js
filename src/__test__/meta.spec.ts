import { CCKey } from "../index";

describe("meta", () => {
    let cckey: CCKey;

    beforeEach(async () => {
        cckey = await CCKey.create({ dbType: "in-memory" });
    });

    afterEach(async () => {
        cckey.close();
    });

    test("defaultEmptyString", async () => {
        const meta = await cckey.getMeta();
        expect(meta).toBe("");
    });

    test("setMeta", async () => {
        await cckey.setMeta("new meta");
        const meta = await cckey.getMeta();
        expect(meta).toBe("new meta");
    });
});
