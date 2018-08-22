declare class CCKey {
    static CCKey: typeof CCKey;
    static create(params?: {
        useMemoryDB?: boolean;
    }): Promise<CCKey>;
    platform: {
        getKeys: () => Promise<string[]>;
        createKey: (params: {
            passphrase?: string | undefined;
        }) => Promise<string>;
        deleteKey: (params: {
            publicKey: string;
            passphrase: string;
        }) => Promise<boolean>;
        sign: (params: {
            publicKey: string;
            message: string;
            passphrase: string;
        }) => Promise<string>;
    };
    asset: {
        getKeys: () => Promise<string[]>;
        createKey: (params: {
            passphrase?: string | undefined;
        }) => Promise<string>;
        deleteKey: (params: {
            publicKey: string;
            passphrase: string;
        }) => Promise<boolean>;
        sign: (params: {
            publicKey: string;
            message: string;
            passphrase: string;
        }) => Promise<string>;
    };
    pkh: {
        insertPKH: (params: {
            publicKey: string;
        }) => Promise<string>;
        getPKH: (params: {
            hash: string;
        }) => Promise<string | null>;
    };
    private context;
    private constructor();
    close(): Promise<void>;
}
export { CCKey };
