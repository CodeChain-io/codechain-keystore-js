import { getPublicFromPrivate, signEcdsa } from "codechain-primitives";
import * as _ from "lodash";
import { Context } from "../context";
import { ErrorCode, KeystoreError } from "../logic/error";
import { decode, encode } from "../logic/hdstorage";
import {
    PrivateKey,
    PublicKey,
    SecretSeedStorage,
    Seed,
    SeedHash
} from "../types";
import { getTableName, KeyType } from "./keytypes";

const bitcore = require("bitcore-lib");
const HDPrivateKey = bitcore.HDPrivateKey;
const Random = bitcore.crypto.Random;

export async function getSeedHashes(context: Context): Promise<SeedHash[]> {
    const rows: any = await context.db
        .get(getTableName(KeyType.HDWSeed))
        .value();
    return _.map(
        rows,
        (storage: SecretSeedStorage) => storage.seedHash
    ) as SeedHash[];
}

export async function exportSeed(
    context: Context,
    params: { seedHash: SeedHash; passphrase: string }
): Promise<SecretSeedStorage> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchSeedHash);
    }
    decode(secret, params.passphrase);
    return secret;
}

export async function exportRawSeed(
    context: Context,
    params: { seedHash: SeedHash; passphrase: string }
): Promise<Seed> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchSeedHash);
    }
    return decode(secret, params.passphrase);
}

export function importSeed(
    context: Context,
    params: {
        secret: SecretSeedStorage;
        passphrase: string;
    }
): Promise<SeedHash> {
    const seed = decode(params.secret, params.passphrase);
    return importSeedToDB(context, {
        seed,
        passphrase: params.passphrase,
        meta: params.secret.meta
    });
}

export function importRawSeed(
    context: Context,
    params: {
        seed: Seed;
        passphrase?: string;
        meta?: string;
    }
): Promise<SeedHash> {
    return importSeedToDB(context, params);
}

export async function createSeed(
    context: Context,
    params: { passphrase?: string; meta?: string }
): Promise<SeedHash> {
    const seed = Random.getRandomBuffer(64).toString("hex");
    return importSeedToDB(context, {
        ...params,
        seed
    });
}

export async function deleteSeed(
    context: Context,
    params: { seedHash: SeedHash }
): Promise<boolean> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        return false;
    }

    await removeKey(context, params);
    return true;
}

export async function getPublicKeyFromSeed(
    context: Context,
    params: {
        seedHash: SeedHash;
        path: string;
        passphrase: string;
    }
): Promise<PublicKey> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchSeedHash);
    }

    const seed = decode(secret, params.passphrase);
    const masterKey = HDPrivateKey.fromSeed(seed);
    const derivedKey = masterKey.derive(params.path);
    const privateKey = derivedKey.privateKey.toString();
    const publicKey = getPublicFromPrivate(privateKey);

    return publicKey;
}

export async function getPrivateKeyFromSeed(
    context: Context,
    params: {
        seedHash: SeedHash;
        path: string;
        passphrase: string;
    }
): Promise<PrivateKey> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchSeedHash);
    }

    const seed = decode(secret, params.passphrase);
    const masterKey = HDPrivateKey.fromSeed(seed);
    const derivedKey = masterKey.derive(params.path);
    const privateKey = derivedKey.privateKey.toString();

    return privateKey;
}

export async function signFromSeed(
    context: Context,
    params: {
        seedHash: SeedHash;
        path: string;
        message: string;
        passphrase: string;
    }
): Promise<string> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchSeedHash);
    }

    const seed = decode(secret, params.passphrase);
    const masterKey = HDPrivateKey.fromSeed(seed);
    const derivedKey = masterKey.derive(params.path);
    const privateKey = derivedKey.privateKey.toString();

    const { r, s, v } = signEcdsa(params.message, privateKey);
    const sig = `${_.padStart(r, 64, "0")}${_.padStart(s, 64, "0")}${_.padStart(
        v.toString(16),
        2,
        "0"
    )}`;
    return sig;
}

async function importSeedToDB(
    context: Context,
    params: {
        seed: Seed;
        passphrase?: string;
        meta?: string;
    }
): Promise<SeedHash> {
    const passphrase = params.passphrase || "";
    const meta = params.meta || "{}";

    const secret = encode(params.seed, passphrase, meta);
    const rows = context.db.get(getTableName(KeyType.HDWSeed));
    await rows.push(secret).write();
    return secret.seedHash;
}

async function getSecretSeedStorage(
    context: Context,
    params: { seedHash: SeedHash }
): Promise<SecretSeedStorage | null> {
    const collection = context.db.get(getTableName(KeyType.HDWSeed));
    const secret = await collection
        .find(
            (secretStorage: SecretSeedStorage) =>
                secretStorage.seedHash === params.seedHash
        )
        .value();

    if (secret == null) {
        return null;
    }
    return secret as SecretSeedStorage;
}

async function removeKey(
    context: Context,
    params: { seedHash: SeedHash }
): Promise<void> {
    const collection = context.db.get(getTableName(KeyType.HDWSeed));
    await collection
        .remove(
            (secret: SecretSeedStorage) => secret.seedHash === params.seedHash
        )
        .write();
}

export async function getMeta(
    context: Context,
    params: { seedHash: SeedHash }
): Promise<string> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    return secret.meta;
}

export async function save(context: Context): Promise<SecretSeedStorage[]> {
    return await context.db.get(getTableName(KeyType.HDWSeed)).value();
}

export async function load(
    context: Context,
    value: SecretSeedStorage[]
): Promise<void> {
    return context.db.set(getTableName(KeyType.HDWSeed), value).write();
}

export async function clear(context: Context): Promise<void> {
    await context.db.unset(getTableName(KeyType.HDWSeed)).write();
}
