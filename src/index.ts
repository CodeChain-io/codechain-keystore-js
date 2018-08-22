import { Context, createContext, closeContext } from "./context";
import { getKeys, createKey, deleteKey, sign, KeyType } from "./model/keys";
import { insertPKH, getPKH } from "./model/pkhs";

class CCKey {
    public static CCKey = CCKey;

    public static async create(params: {
        useMemoryDB?: boolean
    } = {}): Promise<CCKey> {
        const useMemoryDB = params.useMemoryDB || false;
        const context = await createContext({ useMemoryDB });
        return new CCKey(context);
    }

    public platform = {
        getKeys: () => {
            return getKeys(this.context, { keyType: KeyType.Platform });
        },

        createKey: (params: { passphrase?: string }) => {
            return createKey(this.context, { ...params, keyType: KeyType.Platform });
        },

        deleteKey: (params: { publicKey: string, passphrase: string }) => {
            return deleteKey(this.context, { ...params, keyType: KeyType.Platform });
        },

        sign: (params: { publicKey: string, message: string, passphrase: string }) => {
            return sign(this.context, { ...params, keyType: KeyType.Platform });
        }
    }

    public asset = {
        getKeys: () => {
            return getKeys(this.context, { keyType: KeyType.Asset });
        },

        createKey: (params: { passphrase?: string }) => {
            return createKey(this.context, { ...params, keyType: KeyType.Asset });
        },

        deleteKey: (params: { publicKey: string, passphrase: string }) => {
            return deleteKey(this.context, { ...params, keyType: KeyType.Asset });
        },

        sign: (params: { publicKey: string, message: string, passphrase: string }) => {
            return sign(this.context, { ...params, keyType: KeyType.Asset });
        }
    }

    public pkh = {
        insertPKH: (params: { publicKey: string }) => {
            return insertPKH(this.context, params);
        },

        getPKH: (params: { hash: string }) => {
            return getPKH(this.context, params);
        }
    }

    private context: Context;

    private constructor(context: Context) {
        this.context = context;
    }

    public close(): Promise<void> {
        return closeContext(this.context);
    }
}

export { CCKey };

module.exports = CCKey;
