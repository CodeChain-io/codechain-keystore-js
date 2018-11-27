import { getPublicFromPrivate } from "codechain-primitives";
import { closeContext, Context, createContext, storageExist } from "./context";
import { decode } from "./logic/storage";
import * as HDKeys from "./model/hdkeys";
import { initialize as dbInitialize } from "./model/initialize";
import * as Keys from "./model/keys";

import { KeyType } from "./model/keytypes";
import {
    Key,
    PrivateKey,
    PublicKey,
    SecretSeedStorage,
    SecretStorage,
    Seed,
    SeedHash
} from "./types";

export { SecretStorage };

export interface KeyStore {
    getKeys(): Promise<Key[]>;
    importRaw(params: {
        privateKey: PrivateKey;
        passphrase?: string;
        meta?: string;
    }): Promise<Key>;
    exportKey(params: { key: Key; passphrase: string }): Promise<SecretStorage>;
    importKey(params: {
        secret: SecretStorage;
        passphrase: string;
    }): Promise<Key>;
    exportRawKey(params: { key: Key; passphrase: string }): Promise<PrivateKey>;
    getPublicKey(params: {
        key: Key;
        passphrase: string;
    }): Promise<PublicKey | null>;
    createKey(params: { passphrase?: string; meta?: string }): Promise<Key>;
    deleteKey(params: { key: Key }): Promise<boolean>;
    sign(params: {
        key: Key;
        message: string;
        passphrase: string;
    }): Promise<string>;

    getMeta(params: { key: Key }): Promise<string>;

    save(): Promise<SecretStorage[]>;
    load(value: SecretStorage[]): Promise<void>;

    clear(): Promise<void>;
}

export interface HDWKeyStore {
    getSeedHashes(): Promise<SeedHash[]>;
    importSeed(params: {
        secret: SecretSeedStorage;
        passphrase?: string;
    }): Promise<SeedHash>;
    importRawSeed(params: {
        seed: Seed;
        passphrase?: string;
        meta?: string;
    }): Promise<SeedHash>;
    importMnemonic(params: {
        mnemonic: string;
        passphrase?: string;
        meta?: string;
    }): Promise<SeedHash>;
    exportSeed(params: {
        seedHash: SeedHash;
        passphrase: string;
    }): Promise<SecretSeedStorage>;
    exportRawSeed(params: {
        seedHash: SeedHash;
        passphrase: string;
    }): Promise<Seed>;
    exportMnemonic(params: {
        seedHash: SeedHash;
        passphrase: string;
    }): Promise<string>;
    createSeed(params: {
        seedLength?: number;
        passphrase?: string;
        meta?: string;
    }): Promise<SeedHash>;
    deleteSeed(params: { seedHash: SeedHash }): Promise<boolean>;
    getPublicKeyFromSeed(params: {
        seedHash: SeedHash;
        path: string;
        passphrase?: string;
    }): Promise<PublicKey>;
    getPrivateKeyFromSeed(params: {
        seedHash: SeedHash;
        path: string;
        passphrase?: string;
    }): Promise<PrivateKey>;
    signFromSeed(params: {
        seedHash: SeedHash;
        path: string;
        message: string;
        passphrase: string;
    }): Promise<string>;

    getMeta(params: { seedHash: SeedHash }): Promise<string>;

    save(): Promise<SecretSeedStorage[]>;
    load(value: SecretSeedStorage[]): Promise<void>;

    clear(): Promise<void>;
}

class CCKey {
    public static CCKey = CCKey;

    public static async create(
        params: {
            dbType?: string;
            dbPath?: string;
        } = {}
    ): Promise<CCKey> {
        const dbType = params.dbType || "persistent";
        const dbPath = params.dbPath || "keystore.db";
        const context = await createContext({
            dbType,
            dbPath
        });
        return new CCKey(context);
    }
    public static async exist(
        params: {
            dbType?: string;
            dbPath?: string;
        } = {}
    ): Promise<boolean> {
        const dbType = params.dbType || "persistent";
        const dbPath = params.dbPath || "keystore.db";
        return storageExist({ dbType, dbPath });
    }

    public platform: KeyStore = createKeyStore(this.context, KeyType.Platform);
    public asset: KeyStore = createKeyStore(this.context, KeyType.Asset);
    public hdwseed: HDWKeyStore = createHDKeyStore(this.context);

    private constructor(private context: Context) {}

    public getMeta(): Promise<string> {
        return this.context.db.get("meta").value();
    }

    public setMeta(meta: string): Promise<string> {
        return this.context.db.set("meta", meta).write();
    }

    public close(): Promise<void> {
        return closeContext(this.context);
    }

    public async migrate(
        data: string,
        params: { assetPassphrase: string[]; platformPassphrase: string[] }
    ): Promise<string> {
        const old = JSON.parse(data);
        const platform_keys: any[] = old.platform_keys;
        const asset_keys: any[] = old.asset_keys;
        if (platform_keys.length !== params.platformPassphrase.length) {
            throw new Error(
                "The length of platform key doesn't match with the length of passphrase"
            );
        }
        if (asset_keys.length !== params.assetPassphrase.length) {
            throw new Error(
                "The length of asset key doesn't match with the length of passphrase"
            );
        }
        const platform = await Promise.all(
            platform_keys
                .map(key => JSON.parse(key.secret))
                .map(async (storage, i) => {
                    const passphrase = params.platformPassphrase[i];
                    const privateKey = await decode(storage, passphrase);
                    const publicKey = getPublicFromPrivate(privateKey);
                    storage.address = Keys.keyFromPublicKey(
                        KeyType.Platform,
                        publicKey
                    );
                    return storage;
                })
        );
        const asset = await Promise.all(
            asset_keys
                .map(key => JSON.parse(key.secret))
                .map(async (storage, i) => {
                    const passphrase = params.assetPassphrase[i];
                    const privateKey = await decode(storage, passphrase);
                    const publicKey = getPublicFromPrivate(privateKey);
                    storage.address = Keys.keyFromPublicKey(
                        KeyType.Asset,
                        publicKey
                    );
                    return storage;
                })
        );
        return JSON.stringify({
            meta: "{}",
            platform,
            asset,
            hdwseed: []
        });
    }

    public async save(): Promise<string> {
        const meta = await this.getMeta();
        const platform = await this.platform.save();
        const asset = await this.asset.save();
        const hdwseed = await this.hdwseed.save();
        return JSON.stringify({
            meta,
            platform,
            asset,
            hdwseed
        });
    }

    public async load(value: string): Promise<void> {
        const data = JSON.parse(value);
        await this.setMeta(data.meta);
        await this.platform.load(data.platform);
        await this.asset.load(data.asset);
        await this.hdwseed.load(data.hdwseed);
    }

    public async clear(): Promise<void> {
        await this.context.db.unset("meta").write();
        await this.platform.clear();
        await this.asset.clear();
        await this.hdwseed.clear();
        await dbInitialize(this.context.db);
    }
}

function createKeyStore(context: Context, keyType: KeyType): KeyStore {
    return {
        getKeys: () => {
            return Keys.getKeys(context, { keyType });
        },

        importRaw: (params: {
            privateKey: PrivateKey;
            passphrase?: string;
            meta?: string;
        }) => {
            return Keys.importRaw(context, { ...params, keyType });
        },

        exportKey: (params: { key: Key; passphrase: string }) => {
            return Keys.exportKey(context, { ...params, keyType });
        },

        importKey: (params: { secret: SecretStorage; passphrase: string }) => {
            return Keys.importKey(context, { ...params, keyType });
        },

        exportRawKey: (params: { key: Key; passphrase: string }) => {
            return Keys.exportRawKey(context, { ...params, keyType });
        },

        getPublicKey: (params: { key: Key; passphrase: string }) => {
            return Keys.getPublicKey(context, { ...params, keyType });
        },

        createKey: (params: { passphrase?: string; meta?: string }) => {
            return Keys.createKey(context, { ...params, keyType });
        },

        deleteKey: (params: { key: Key }) => {
            return Keys.deleteKey(context, { ...params, keyType });
        },

        sign: (params: { key: Key; message: string; passphrase: string }) => {
            return Keys.sign(context, { ...params, keyType });
        },

        getMeta: (params: { key: Key }) => {
            return Keys.getMeta(context, { ...params, keyType });
        },

        save: () => {
            return Keys.save(context, { keyType });
        },

        load: (value: SecretStorage[]) => {
            return Keys.load(context, value, { keyType });
        },

        clear: () => {
            return Keys.clear(context, { keyType });
        }
    };
}

function createHDKeyStore(context: Context): HDWKeyStore {
    return {
        getSeedHashes: () => {
            return HDKeys.getSeedHashes(context);
        },

        importSeed: (params: {
            secret: SecretSeedStorage;
            passphrase: string;
        }) => {
            return HDKeys.importSeed(context, params);
        },

        importRawSeed: (params: {
            seed: Seed;
            passphrase?: string;
            meta?: string;
        }) => {
            return HDKeys.importRawSeed(context, params);
        },

        importMnemonic: (params: {
            mnemonic: string;
            passphrase?: string;
            meta?: string;
        }) => {
            return HDKeys.importMnemonic(context, params);
        },

        exportSeed: (params: { seedHash: SeedHash; passphrase: string }) => {
            return HDKeys.exportSeed(context, params);
        },

        exportRawSeed: (params: { seedHash: SeedHash; passphrase: string }) => {
            return HDKeys.exportRawSeed(context, params);
        },

        exportMnemonic: (params: {
            seedHash: SeedHash;
            passphrase: string;
        }) => {
            return HDKeys.exportMnemonic(context, params);
        },

        createSeed: (params: {
            seedLength?: number;
            passphrase?: string;
            meta?: string;
        }) => {
            return HDKeys.createSeed(context, params);
        },

        deleteSeed: (params: { seedHash: SeedHash }) => {
            return HDKeys.deleteSeed(context, params);
        },

        getPublicKeyFromSeed: (params: {
            seedHash: SeedHash;
            path: string;
            passphrase: string;
        }) => {
            return HDKeys.getPublicKeyFromSeed(context, params);
        },

        getPrivateKeyFromSeed: (params: {
            seedHash: SeedHash;
            path: string;
            passphrase: string;
        }) => {
            return HDKeys.getPrivateKeyFromSeed(context, params);
        },

        signFromSeed: (params: {
            seedHash: SeedHash;
            path: string;
            message: string;
            passphrase: string;
        }) => {
            return HDKeys.signFromSeed(context, params);
        },

        getMeta: (params: { seedHash: SeedHash }) => {
            return HDKeys.getMeta(context, params);
        },

        save: () => {
            return HDKeys.save(context);
        },

        load: (value: SecretSeedStorage[]) => {
            return HDKeys.load(context, value);
        },

        clear: () => {
            return HDKeys.clear(context);
        }
    };
}

export { CCKey };

module.exports = CCKey;
