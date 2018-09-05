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
export interface KeyStore {
    getKeys(): Promise<string[]>;
    importRaw(params: {
        privateKey: string;
        passphrase?: string;
    }): Promise<string>;
    exportKey(params: {
        publicKey: string;
        passphrase: string;
    }): Promise<SecretStorage>;
    importKey(params: {
        secret: SecretStorage;
        passphrase: string;
    }): Promise<string>;
    createKey(params: {
        passphrase?: string;
    }): Promise<string>;
    deleteKey(params: {
        publicKey: string;
    }): Promise<boolean>;
    sign(params: {
        publicKey: string;
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
    mapping: {
        add: (params: {
            key: string;
            value: string;
        }) => Promise<void>;
        get: (params: {
            key: string;
        }) => Promise<string | null>;
    };
    private constructor();
    close(): Promise<void>;
}
export { CCKey };
