import { Key, PrivateKey, PublicKey, SecretStorage } from "./types";
export { SecretStorage };
export interface KeyStore {
    getKeys(): Promise<Key[]>;
    importRaw(params: {
        privateKey: PublicKey;
        passphrase?: string;
    }): Promise<Key>;
    exportKey(params: {
        key: Key;
        passphrase: string;
    }): Promise<SecretStorage>;
    importKey(params: {
        secret: SecretStorage;
        passphrase: string;
    }): Promise<Key>;
    exportRawKey(params: {
        key: Key;
        passphrase: string;
    }): Promise<PrivateKey>;
    getPublicKey(params: {
        key: Key;
    }): Promise<PublicKey | null>;
    createKey(params: {
        passphrase?: string;
    }): Promise<Key>;
    deleteKey(params: {
        key: Key;
    }): Promise<boolean>;
    sign(params: {
        key: Key;
        message: string;
        passphrase: string;
    }): Promise<string>;
}
declare class CCKey {
    private context;
    static CCKey: typeof CCKey;
    static create(params?: {
        useMemoryDB?: boolean;
        dbPath?: string;
    }): Promise<CCKey>;
    platform: KeyStore;
    asset: KeyStore;
    private constructor();
    close(): Promise<void>;
}
export { CCKey };
