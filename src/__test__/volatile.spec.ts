import * as crypto from "crypto";
import { CCKey } from "../index";

describe("volatile", () => {
    const dbPath = crypto.randomBytes(4).toString("hex");
    const dbType = "volatile";
    const params = { dbPath, dbType };
    beforeEach(async () => {
        const cckey = await CCKey.create(params);
        cckey.close();
    });

    test("volatile db removes data on close", async () => {
        const cckey = await CCKey.create(params);
        const createdKey = await cckey.platform.createKey({ meta: "meta" });
        await expect(await cckey.platform.getKeys()).toEqual([createdKey]);
        expect(await cckey.platform.getMeta({ key: createdKey })).toBe("meta");
        await cckey.close();

        const cckey2 = await CCKey.create(params);
        await expect(await cckey2.platform.getKeys()).toEqual([]);
        await expect(
            cckey2.platform.getMeta({ key: createdKey })
        ).rejects.toThrow();
    });

    test("false if not exist", async () => {
        expect(await CCKey.exist(params)).toBe(false);
    });

    test("true if exist", async () => {
        await CCKey.create(params);
        expect(await CCKey.exist(params)).toBe(true);
    });

    test("doesn't exist if volatile db closed", async () => {
        const cckey = await CCKey.create(params);
        await cckey.close();
        expect(await CCKey.exist(params)).toBe(false);
    });
});
