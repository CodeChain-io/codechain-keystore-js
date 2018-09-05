import { closeContext, Context, createContext } from "./context";
import * as KeysLogic from "./logic/keys";
import {
    exportKey,
    getKeys,
    importKey,
    importRaw,
    KeyType,
    sign
} from "./model/keys";
import { getMapping } from "./model/mapping";

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
    createKey(params: { passphrase?: string }): Promise<string>;
    deleteKey(params: { publicKey: string }): Promise<boolean>;
    sign(params: {
        publicKey: string;
        message: string;
        passphrase: string;
    }): Promise<string>;
}

class CCKey {
    public static CCKey = CCKey;

    public static async create(
        params: {
            useMemoryDB?: boolean;
            dbPath?: string;
        } = {}
    ): Promise<CCKey> {
        const useMemoryDB = params.useMemoryDB || false;
        const dbPath = params.dbPath || "keystore.db";
        const context = await createContext({ useMemoryDB, dbPath });
        return new CCKey(context);
    }

    public platform: KeyStore = createKeyStore(this.context, KeyType.Platform);
    public asset: KeyStore = createKeyStore(this.context, KeyType.Asset);

    public mapping = {
        get: (params: { key: string }) => {
            return getMapping(this.context, params);
        }
    };

    private constructor(private context: Context) {}

    public close(): Promise<void> {
        return closeContext(this.context);
    }
}

function createKeyStore(context: Context, keyType: KeyType): KeyStore {
    return {
        getKeys: () => {
            return getKeys(context, { keyType });
        },

        importRaw: (params: { privateKey: string; passphrase?: string }) => {
            return importRaw(context, { ...params, keyType });
        },

        exportKey: (params: { publicKey: string; passphrase: string }) => {
            return exportKey(context, { ...params, keyType });
        },

        importKey: (params: { secret: SecretStorage; passphrase: string }) => {
            return importKey(context, { ...params, keyType });
        },

        createKey: (params: { passphrase?: string }) => {
            return KeysLogic.createKey(context, { ...params, keyType });
        },

        deleteKey: (params: { publicKey: string }) => {
            return KeysLogic.deleteKey(context, { ...params, keyType });
        },

        sign: (params: {
            publicKey: string;
            message: string;
            passphrase: string;
        }) => {
            return sign(context, { ...params, keyType });
        }
    };
}

export { CCKey };

module.exports = CCKey;
