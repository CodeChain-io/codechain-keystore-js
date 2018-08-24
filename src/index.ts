import { Context, createContext, closeContext } from "./context";
import { getKeys, createKey, deleteKey, sign, KeyType } from "./model/keys";
import { addMapping, getMapping } from "./model/mapping";

export interface KeyStore {
    getKeys(): Promise<string[]>;
    createKey(params: { passphrase?: string }): Promise<string>;
    deleteKey(params: { publicKey: string }): Promise<boolean>;
    sign(params: { publicKey: string, message: string, passphrase: string }): Promise<string>;
}

class CCKey {
    public static CCKey = CCKey;

    public static async create(params: {
        useMemoryDB?: boolean,
        dbPath?: string
    } = {}): Promise<CCKey> {
        const useMemoryDB = params.useMemoryDB || false;
        const dbPath = params.dbPath || "keystore.db";
        const context = await createContext({ useMemoryDB, dbPath });
        return new CCKey(context);
    }

    public platform: KeyStore = createKeyStore(this.context, KeyType.Platform);
    public asset: KeyStore = createKeyStore(this.context, KeyType.Asset);

    public mapping = {
        add: (params: { key: string; value: string }) => {
            return addMapping(this.context, params);
        },

        get: (params: { key: string }) => {
            return getMapping(this.context, params);
        }
    }

    private constructor(private context: Context) {
    }

    public close(): Promise<void> {
        return closeContext(this.context);
    }
}

function createKeyStore(context: Context, keyType: KeyType): KeyStore {
    return {
        getKeys: () => {
            return getKeys(context, { keyType });
        },

        createKey: (params: { passphrase?: string }) => {
            return createKey(context, { ...params, keyType });
        },

        deleteKey: (params: { publicKey: string }) => {
            return deleteKey(context, { ...params, keyType });
        },

        sign: (params: { publicKey: string, message: string, passphrase: string }) => {
            return sign(context, { ...params, keyType });
        }
    };
}

export { CCKey };

module.exports = CCKey;
