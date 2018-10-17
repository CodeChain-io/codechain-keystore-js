/**
 * Key is a type which is used to query the KeyStore.
 * Each KeyType has different key generation algorithm.
 * Key is generated from public key.
 */
export type Key = AccountId | PublicKeyHash;
export type PublicKeyHash = string;
export type AccountId = string;
export type PublicKey = string;
export type PrivateKey = string;
export type Seed = string;
export type SeedHash = string;

export interface SecretStorage {
    crypto: {
        cipher: string;
        cipherparams: {
            iv: string;
        };
        ciphertext: string;
        kdf: string;
        kdfparams: {
            c: number;
            dklen: number;
            prf: string;
            salt: string;
        };
        mac: string;
    };
    meta: string;
    address?: string;
    id: string;
    version: number;
}

export interface SecretSeedStorage {
    crypto: {
        cipher: string;
        cipherparams: {
            iv: string;
        };
        ciphertext: string;
        kdf: string;
        kdfparams: {
            c: number;
            dklen: number;
            prf: string;
            salt: string;
        };
        mac: string;
    };
    meta: string;
    seedHash: SeedHash;
    id: string;
    version: number;
}
