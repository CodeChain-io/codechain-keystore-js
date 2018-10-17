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

    test.each([
        [
            "d0a8182a44b71802ba85d35fad626c6275a82afb943dfee10d851140a61f74df317e3ac53e693f3e382cc856abe3a3f29b8d0e9ae06846719387aef9c6219d83",
            "7a407db56166dedce848ccfbd444978fb3b13282f3c362c800469465f72b0242ded44cb1130ce9796602ced6d2710988ca6731f006a2b73ade4331b090e2132d",
            "a532e2b9e5d7c13c42229e7dd361086eaaef174df57f5484d8c5566ce3bf141c",
            "5d9aaf1ed9f268d9a78ac9f75107d0b9be6a2d0470ef271caf1a038c22063df87b6bf1589d4f96e4dbff16d3cf0605899c253a9c9188bda9fc566849e8cd3f7100"
        ],
        [
            "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            "669261fe20452fe6a03e625944c6a0523e6350b3ea8cbd37c9ca1ff97e3ac8bf3dd2d51a09d6d4831cb2bc9828c5af14ce4c3384c973d75aad423626a2a6d18d",
            "eafd15702fca3f80beb565e66f19e20bbad0a34b46bb12075cbf1c5d94bb27d2",
            "03e7108a74cfe1d4921c47a6f6ba3d4b49f6d6f8243bddfbb5c7ae383a3e3f5a522d91ce061fd44a09233a4991d6cf27a4cac4e3ed2aa81cc455455ff55005f501"
        ],
        [
            "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "3c4ebbf61781db49e0870349c793f484e962a001804dc7dbb9669447a787a67a0b7bb61d753d84054f45d3d64ed742350ea7487c2e3da1dd641047434e84ea2f",
            "8f2eb3f4358e84106dffe74e1b20700c24ae8f315b08c9666c3d6c8c90985a63",
            "66d97dbf806515ba69ed75937f02cc22bf8e90e14acd6f6f5c5b9a79fdca7a1444525423e6a7252afb6f0331f8bc8a7f349cd2868e57c22c16a105967eca21ed01"
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
