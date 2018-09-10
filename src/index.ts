import { closeContext, Context, createContext } from "./context";
import * as KeysLogic from "./logic/keys";
import { KeyType } from "./model/keys";
import * as MappingModel from "./model/mapping";
import { Key, PrivateKey, PublicKey, SecretStorage } from "./types";

export { SecretStorage };

export interface KeyStore {
    getKeys(): Promise<Key[]>;
    importRaw(params: {
        privateKey: PublicKey;
        passphrase?: string;
    }): Promise<Key>;
    exportKey(params: { key: Key; passphrase: string }): Promise<SecretStorage>;
    importKey(params: {
        secret: SecretStorage;
        passphrase: string;
    }): Promise<Key>;
    exportRawKey(params: { key: Key; passphrase: string }): Promise<PrivateKey>;
    getPublicKey(params: { key: Key }): Promise<PublicKey | null>;
    createKey(params: { passphrase?: string }): Promise<Key>;
    deleteKey(params: { key: Key }): Promise<boolean>;
    sign(params: {
        key: Key;
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

    private constructor(private context: Context) {}

    public close(): Promise<void> {
        return closeContext(this.context);
    }
}

function createKeyStore(context: Context, keyType: KeyType): KeyStore {
    return {
        getKeys: () => {
            return KeysLogic.getKeys(context, { keyType });
        },

        importRaw: (params: {
            privateKey: PrivateKey;
            passphrase?: string;
        }) => {
            return KeysLogic.importRaw(context, { ...params, keyType });
        },

        exportKey: (params: { key: Key; passphrase: string }) => {
            return KeysLogic.exportKey(context, { ...params, keyType });
        },

        importKey: (params: { secret: SecretStorage; passphrase: string }) => {
            return KeysLogic.importKey(context, { ...params, keyType });
        },

        exportRawKey: (params: { key: Key; passphrase: string }) => {
            return KeysLogic.exportRawKey(context, { ...params, keyType });
        },

        getPublicKey: (params: { key: Key }) => {
            return MappingModel.getPublicKey(context, params);
        },

        createKey: (params: { passphrase?: string }) => {
            return KeysLogic.createKey(context, { ...params, keyType });
        },

        deleteKey: (params: { key: Key }) => {
            return KeysLogic.deleteKey(context, { ...params, keyType });
        },

        sign: (params: { key: Key; message: string; passphrase: string }) => {
            return KeysLogic.sign(context, { ...params, keyType });
        }
    };
}

export { CCKey };

module.exports = CCKey;
