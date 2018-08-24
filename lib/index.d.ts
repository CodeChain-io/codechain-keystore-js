export interface KeyStore {
    getKeys(): Promise<string[]>;
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
