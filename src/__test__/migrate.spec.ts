import { CCKey } from "../index";

describe("migrate", () => {
    test("migrate", async () => {
        const cckey = await CCKey.create({ dbType: "in-memory" });
        const oldFormat = JSON.stringify({
            platform_keys: [
                {
                    secret:
                        '{"crypto":{"ciphertext":"f4139cc2021a4f839574602d9825e95c2f8d05dc52b50203d64f0b6ff53f4550","cipherparams":{"iv":"280af65c7138efa041ea7994a37c62cd"},"cipher":"aes-128-ctr","kdf":"pbkdf2","kdfparams":{"dklen":32,"salt":"05b56bc53ec8838575e5f243587f0a5b9ad2a2c3aab0df0e400dc78dbc81e4d1","c":262144,"prf":"hmac-sha256"},"mac":"1aa9cc11f124855b88638e97392350f230ac54c3d2efaf214a4246bbadd6c569"},"id":"253f7017-aa61-4797-94ea-7ac4402fd239","version":3}',
                    publicKey:
                        "b71f1a9a5fb63155b7ccc12841867e95a33da91c305158045a6c7c5e575f204828adec3980387a12ef9f159721c853e47e64a37f61407e0131e9e62983cd6d2e"
                },
                {
                    secret:
                        '{"crypto":{"ciphertext":"44e864dae8cb46d580bbd3dc20406c8e4237675572b38402f1c243d3f6e44bc6","cipherparams":{"iv":"399d7384431cf49327596fd08b9a9728"},"cipher":"aes-128-ctr","kdf":"pbkdf2","kdfparams":{"dklen":32,"salt":"38c580bfad2fd102da367e9ee81a92e8cba0ff43911eb329e9dea1ea53c28abf","c":262144,"prf":"hmac-sha256"},"mac":"d564c4a1122ae1cb080519fe0345f678b68c16eb47a92351afce77e6c3fad04e"},"id":"e4eaa554-c0c4-48dd-842d-99b3c92419a1","version":3}',
                    publicKey:
                        "4c00868624282ee68380f07f1d3368be18447453913eb6b91955975d55b9887a91d632b6f8295434d29c2f7910800e4edd1e867fad6ed21aab1f57f1b56845b9"
                }
            ],
            asset_keys: [
                {
                    secret:
                        '{"crypto":{"ciphertext":"a3a9c3201cd59668b8c50059bf615ad79bc7e3d7242ed8bedbecb4a539adc824","cipherparams":{"iv":"15d160ab147a3143f7a0f424f0a8818a"},"cipher":"aes-128-ctr","kdf":"pbkdf2","kdfparams":{"dklen":32,"salt":"f050b633d76bbb081925adc4bc2d3871e02fa873a4123cbc1069450b492de2aa","c":262144,"prf":"hmac-sha256"},"mac":"fe025d8bcc9bfe77761f7928500b79643ed89543ff9e4905e083efe2ec716d60"},"id":"e5b859ca-9efd-4a5d-abc7-fd0ad721f57b","version":3}',
                    publicKey:
                        "7a57a8c36aa652015f5f736b74655acb89a640e18fcbd1ef91402ca6322b34ea2ca10f97a2456e667d47d60c140380eedb9b350128085da8b788bc75906436a2"
                }
            ],
            mapping: {
                "9c6913351145c88cebd1d16fe47720cb98f796b8":
                    "b71f1a9a5fb63155b7ccc12841867e95a33da91c305158045a6c7c5e575f204828adec3980387a12ef9f159721c853e47e64a37f61407e0131e9e62983cd6d2e",
                "3c25ad001aa929131c2924275b95ef1f86d61a48":
                    "4c00868624282ee68380f07f1d3368be18447453913eb6b91955975d55b9887a91d632b6f8295434d29c2f7910800e4edd1e867fad6ed21aab1f57f1b56845b9",
                df87b2faf36eacdf6d4136ad111ce97cfc87170a:
                    "7a57a8c36aa652015f5f736b74655acb89a640e18fcbd1ef91402ca6322b34ea2ca10f97a2456e667d47d60c140380eedb9b350128085da8b788bc75906436a2"
            }
        });
        const result = JSON.parse(
            cckey.migrate(oldFormat, {
                platformPassphrase: ["a", "b"],
                assetPassphrase: ["c"]
            })
        );

        const newFormat = {
            platform: [
                {
                    crypto: {
                        ciphertext:
                            "f4139cc2021a4f839574602d9825e95c2f8d05dc52b50203d64f0b6ff53f4550",
                        cipherparams: {
                            iv: "280af65c7138efa041ea7994a37c62cd"
                        },
                        cipher: "aes-128-ctr",
                        kdf: "pbkdf2",
                        kdfparams: {
                            dklen: 32,
                            salt:
                                "05b56bc53ec8838575e5f243587f0a5b9ad2a2c3aab0df0e400dc78dbc81e4d1",
                            c: 262144,
                            prf: "hmac-sha256"
                        },
                        mac:
                            "1aa9cc11f124855b88638e97392350f230ac54c3d2efaf214a4246bbadd6c569"
                    },
                    address: "9c6913351145c88cebd1d16fe47720cb98f796b8",
                    id: "253f7017-aa61-4797-94ea-7ac4402fd239",
                    version: 3
                },
                {
                    crypto: {
                        ciphertext:
                            "44e864dae8cb46d580bbd3dc20406c8e4237675572b38402f1c243d3f6e44bc6",
                        cipherparams: {
                            iv: "399d7384431cf49327596fd08b9a9728"
                        },
                        cipher: "aes-128-ctr",
                        kdf: "pbkdf2",
                        kdfparams: {
                            dklen: 32,
                            salt:
                                "38c580bfad2fd102da367e9ee81a92e8cba0ff43911eb329e9dea1ea53c28abf",
                            c: 262144,
                            prf: "hmac-sha256"
                        },
                        mac:
                            "d564c4a1122ae1cb080519fe0345f678b68c16eb47a92351afce77e6c3fad04e"
                    },
                    address: "3c25ad001aa929131c2924275b95ef1f86d61a48",
                    id: "e4eaa554-c0c4-48dd-842d-99b3c92419a1",
                    version: 3
                }
            ],
            asset: [
                {
                    crypto: {
                        ciphertext:
                            "a3a9c3201cd59668b8c50059bf615ad79bc7e3d7242ed8bedbecb4a539adc824",
                        cipherparams: {
                            iv: "15d160ab147a3143f7a0f424f0a8818a"
                        },
                        cipher: "aes-128-ctr",
                        kdf: "pbkdf2",
                        kdfparams: {
                            dklen: 32,
                            salt:
                                "f050b633d76bbb081925adc4bc2d3871e02fa873a4123cbc1069450b492de2aa",
                            c: 262144,
                            prf: "hmac-sha256"
                        },
                        mac:
                            "fe025d8bcc9bfe77761f7928500b79643ed89543ff9e4905e083efe2ec716d60"
                    },
                    address: "df87b2faf36eacdf6d4136ad111ce97cfc87170a",
                    id: "e5b859ca-9efd-4a5d-abc7-fd0ad721f57b",
                    version: 3
                }
            ],
            meta: "{}"
        };
        expect(result).toEqual(newFormat);
    });
});
