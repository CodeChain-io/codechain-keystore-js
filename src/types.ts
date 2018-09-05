/**
 * Key is a type which is used to query the KeyStore.
 * Each KeyType has different key generation algorithm.
 * Key is generated from public key.
 */
export type Key = AccountId | PublicKeyHash;
export type PublicKeyHash = string;
export type AccountId = string;
export type PublicKey = string;

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
    id: string;
    version: number;
}
