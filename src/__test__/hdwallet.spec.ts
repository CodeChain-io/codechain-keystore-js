import { getPublicFromPrivate } from "codechain-primitives";
import { CCKey } from "../index";

describe("HD wallet test", () => {
    let cckey: CCKey;
    const passphrase = "satoshi";

    beforeEach(async () => {
        cckey = await CCKey.create({ dbType: "in-memory" });
    });

    afterEach(async () => {
        cckey.close();
    });

    test("create and delete", async () => {
        const seedHash = await cckey.hdwseed.createSeed({ passphrase });
        expect(await cckey.hdwseed.getSeedHashes()).toEqual([seedHash]);
        await cckey.hdwseed.deleteSeed({ seedHash });
        expect(await cckey.hdwseed.getSeedHashes()).toEqual([]);
    });

    test.each(["m/0", "M/0", "m/0/1/2/3/4", "m/0'", "m/0'/1'/2'/3'/4'"])(
        "get public key & private key - %p",
        async path => {
            const seedHash = await cckey.hdwseed.createSeed({ passphrase });
            const publicKey = await cckey.hdwseed.getPublicKeyFromSeed({
                seedHash,
                path,
                passphrase
            });
            const privateKey = await cckey.hdwseed.getPrivateKeyFromSeed({
                seedHash,
                path,
                passphrase
            });

            expect(getPublicFromPrivate(privateKey)).toEqual(publicKey);
        }
    );

    test("export and import", async () => {
        const seedHash = await cckey.hdwseed.createSeed({ passphrase });
        const masterKey = await cckey.hdwseed.getPrivateKeyFromSeed({
            seedHash,
            path: "m",
            passphrase
        });
        const secret = await cckey.hdwseed.exportSeed({
            seedHash,
            passphrase
        });

        await cckey.hdwseed.deleteSeed({ seedHash });
        expect(await cckey.hdwseed.getSeedHashes()).not.toContain(seedHash);

        expect(await cckey.hdwseed.importSeed({ secret, passphrase })).toEqual(
            seedHash
        );
        expect(
            await await cckey.hdwseed.getPrivateKeyFromSeed({
                seedHash,
                path: "m",
                passphrase
            })
        ).toEqual(masterKey);
    });

    test("export raw and import raw", async () => {
        const seedHash = await cckey.hdwseed.createSeed({ passphrase });
        const masterKey = await cckey.hdwseed.getPrivateKeyFromSeed({
            seedHash,
            path: "m",
            passphrase
        });
        const seed = await cckey.hdwseed.exportRawSeed({
            seedHash,
            passphrase
        });

        await cckey.hdwseed.deleteSeed({ seedHash });
        expect(await cckey.hdwseed.getSeedHashes()).not.toContain(seedHash);

        expect(await cckey.hdwseed.importRawSeed({ seed, passphrase })).toEqual(
            seedHash
        );
        expect(
            await await cckey.hdwseed.getPrivateKeyFromSeed({
                seedHash,
                path: "m",
                passphrase
            })
        ).toEqual(masterKey);
    });

    test("export mnemonic and import mnemonic", async () => {
        const seedHash = await cckey.hdwseed.createSeed({ passphrase });
        const masterKey = await cckey.hdwseed.getPrivateKeyFromSeed({
            seedHash,
            path: "m",
            passphrase
        });
        const mnemonic = await cckey.hdwseed.exportMnemonic({
            seedHash,
            passphrase
        });

        await cckey.hdwseed.deleteSeed({ seedHash });
        expect(await cckey.hdwseed.getSeedHashes()).not.toContain(seedHash);

        expect(
            await cckey.hdwseed.importMnemonic({ mnemonic, passphrase })
        ).toEqual(seedHash);
        expect(
            await await cckey.hdwseed.getPrivateKeyFromSeed({
                seedHash,
                path: "m",
                passphrase
            })
        ).toEqual(masterKey);
    });

    test.each([
        [
            "d0a8182a44b71802ba85d35fad626c6275a82afb943dfee10d851140a61f74df",
            "03013cde78fc0c9a1075585fc5b8d911063d10cb2c9afe9969eb37e64e1225e631ee32fd24b85a293012d5cd75aef8e832158aee4f9dc516d506983f6cb65974",
            "88c4410d6003f5b1f0a69d02b6df78b0f65b52eed496ac8d9779f31c7e73b864",
            "11d0905febae1234a37f66330f4548effe4076f7aee9aeb8370cb247ceb7ae9138cb626f955db35a24c51a4f881927968e37cad808c17a41abea5f07ac45b83800"
        ],
        [
            "0000000000000000000000000000000000000000000000000000000000000000",
            "5660b70c8770245fb97ce9a811885e8045a1f333a799dcd3035788606cc557544965a0da8b76d6292adff9e9b38190b842629184e62c76ee028e97bc845f59bc",
            "235b34cd7c9f6d7e4595ffe9ae4b1cb5606df8aca2b527d20a07c8f56b2342f4",
            "6ca5db955e9c82e07529d3ebee8336dec4a44837cf9c453618841f08f841f6f46a4083a01c322c1a89d7fc9a05bf4e2d0cacc2f0da67fda35a83fd4ce739ce4401"
        ],
        [
            "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "115e0cb655e65c687cd435a03c73503da216a50176023d2537f54334534bad27c2bc9f76b34a2fe68fc2a3c3c9af2922dceb904c9cd18a9e994ee2243b5da861",
            "8472fc35dbe9f8ccf7ed306295e84902c0e606e576e5cb3f6c32d98537a21282",
            "36106ab36b67d3947a072bd097613c9dd7612c1bb88ad5b3ce01c3e84e1216bf17d796a797c976e5e8f6180ca3503b6baeeefe80a3dcbedb1e9a0edcdd1343e900"
        ],
        [
            "ffffffffffffffffffffffffffffffff",
            "e01aa32243f6744a2607466304e326adc7cb77e67363341967bf4700be45391dc9a0066b1c6664a432505a20f714f474abe1a7350988c69ea886840b48af2570",
            "f1897f8c5fd5e11814f80c63eb21cc0c63d1623008f895e83c0e9a770fb66544",
            "11fca78e1985e951c9cc7a866626741cefe972a24dd1b68a5c53940436b33a026e0c4736b6b6bc4b3b50600cf8c780e4ca01772272d3664939c571d29fa5a1d800"
        ]
    ])(
        "import fixed raw seed and check: %p",
        async (seed, pubkey, privkey, sign) => {
            const message =
                "0000000000000000000000000000000000000000000000000000000000000000";
            const seedHash = await cckey.hdwseed.importRawSeed({
                seed,
                passphrase
            });
            expect(
                await cckey.hdwseed.getPublicKeyFromSeed({
                    seedHash,
                    path: "m",
                    passphrase
                })
            ).toEqual(pubkey);
            expect(
                await cckey.hdwseed.getPrivateKeyFromSeed({
                    seedHash,
                    path: "m",
                    passphrase
                })
            ).toEqual(privkey);
            expect(
                await cckey.hdwseed.signFromSeed({
                    seedHash,
                    path: "m",
                    message,
                    passphrase
                })
            ).toEqual(sign);
        }
    );
});
