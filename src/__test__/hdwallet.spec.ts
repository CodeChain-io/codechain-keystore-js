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
            "d0a8182a44b71802ba85d35fad626c6275a82afb943dfee10d851140a61f74df317e3ac53e693f3e382cc856abe3a3f29b8d0e9ae06846719387aef9c6219d83",
            "0ab535a5c779da824fd3479d08662ebe1e6ba2243f53ec566093fed60b350dbe3f08acd2de8f73b3182ff8c54c466ba1d6f7a0b4f76abc4da7488a00760ffc41",
            "28b91268e301eedef9a21f8a1d8c8197d32bae027d52661a69a1661a60866721",
            "c34a7431a001c57fd88b00d4572345062c84bf43f0beb4739d1ab390735c079d4a06ed0cc149d1abcfbb31997d985c1bc6d6e03ede1f983ea2ef7439db5c893c01"
        ],
        [
            "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            "b172b522391f3a3c833401db9da311bb49c441753e520050c80a9cfc80a7693e2830ba390b69e730cc50300f6567dc8a73c67bed25681d5fa391c95eaab961dc",
            "5ffce5966f7575197b470eb6544297159327c7a07b77ddee0333fb91f1184b06",
            "1d8647e43109f85153a92b8a3849e51ae11d959dd0e78d190948d13771e75477354590f032059c19b631fbd5c18f25e7919d3af486690fefcf76dbbc66f7d4bb00"
        ],
        [
            "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "6eedc220df648a75d55d1b0b173c95d86986e8e261a6febfc953d3421a617ad62ece40c557f48870554aa8b2cdfaec1ab1e18cc8003d6d817f016d541e9cd17a",
            "71d11c7b88aaa069ee8b095d1e8471f54a317a63adcf7dad63d840af44af338e",
            "bc74cc631a94c75fe746c7e6ceacbd26d801840d0d6e361f2bb675add1d93cfd054e66a9364c33f39001c5893a4a172dd938bf47d40fab7257168f50b5f0cd4e00"
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
