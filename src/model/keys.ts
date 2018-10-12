import {
    generatePrivateKey,
    getPublicFromPrivate,
    signEcdsa
} from "codechain-primitives";
import * as _ from "lodash";
import { Context } from "../context";
import { ErrorCode, KeystoreError } from "../logic/error";
import { decode, encode } from "../logic/storage";
import { Key, PrivateKey, PublicKey, SecretStorage } from "../types";

export enum KeyType {
    Platform,
    Asset
}

function getTableName(type: KeyType) {
    switch (type) {
        case KeyType.Platform:
            return "platform";
        case KeyType.Asset:
            return "asset";
        default:
            throw new Error("Invalid key type");
    }
}

export async function getKeys(
    context: Context,
    params: { keyType: KeyType }
): Promise<Key[]> {
    const rows: any = await context.db
        .get(getTableName(params.keyType))
        .value();
    return _.map(rows, (secret: SecretStorage) => secret.address) as Key[];
}

export async function getPublicKey(
    context: Context,
    params: { key: Key; passphrase: string; keyType: KeyType }
): Promise<PublicKey | null> {
    const secret = await getSecretStorage(context, params);
    if (secret == null) {
        return null;
    }
    return decode(secret, params.passphrase);
}

export function importRaw(
    context: Context,
    params: {
        privateKey: PrivateKey;
        passphrase?: string;
        keyType: KeyType;
        meta?: string;
    }
): Promise<PublicKey> {
    return createPublicKeyFromPrivateKey(context, params);
}

export async function exportKey(
    context: Context,
    params: { key: Key; passphrase: string; keyType: KeyType }
): Promise<SecretStorage> {
    const secret = await getSecretStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    decode(secret, params.passphrase); // Throws an error if the passphrase is incorrect.
    return secret;
}

export async function importKey(
    context: Context,
    params: { secret: SecretStorage; passphrase: string; keyType: KeyType }
): Promise<PublicKey> {
    const privateKey = decode(params.secret, params.passphrase);
    return importRaw(context, {
        privateKey,
        passphrase: params.passphrase,
        keyType: params.keyType,
        meta: params.secret.meta
    });
}

export function createKey(
    context: Context,
    params: { passphrase?: string; keyType: KeyType; meta?: string }
): Promise<PublicKey> {
    const privateKey = generatePrivateKey();
    return createPublicKeyFromPrivateKey(context, {
        ...params,
        privateKey
    });
}

async function createPublicKeyFromPrivateKey(
    context: Context,
    params: {
        privateKey: PrivateKey;
        passphrase?: string;
        keyType: KeyType;
        meta?: string;
    }
): Promise<PublicKey> {
    const publicKey = getPublicFromPrivate(params.privateKey);
    const passphrase = params.passphrase || "";
    const meta = params.meta || "{}";

    const secret = encode(params.privateKey, params.keyType, passphrase, meta);
    const rows = context.db.get(getTableName(params.keyType));
    await rows.push(secret).write();
    return publicKey;
}

export async function deleteKey(
    context: Context,
    params: { key: Key; keyType: KeyType }
): Promise<boolean> {
    const secret = await getSecretStorage(context, params);
    if (secret == null) {
        return false;
    }

    await removeKey(context, params);
    return true;
}

async function getSecretStorage(
    context: Context,
    params: { key: Key; keyType: KeyType }
): Promise<SecretStorage | null> {
    const collection = context.db.get(getTableName(params.keyType));
    const secret = await collection
        .find(
            (secretStorage: SecretStorage) =>
                secretStorage.address === params.key
        )
        .value();

    if (secret == null) {
        return null;
    }
    return secret as SecretStorage;
}

async function removeKey(
    context: Context,
    params: { key: Key; keyType: KeyType }
): Promise<void> {
    const collection = context.db.get(getTableName(params.keyType));
    await collection
        .remove((secret: SecretStorage) => secret.address === params.key)
        .write();
}

export async function exportRawKey(
    context: Context,
    params: { key: Key; passphrase: string; keyType: KeyType }
) {
    const secret = await getSecretStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }

    return decode(secret, params.passphrase);
}

export async function sign(
    context: Context,
    params: {
        key: Key;
        message: string;
        passphrase: string;
        keyType: KeyType;
    }
): Promise<string> {
    const secret = await getSecretStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }

    const privateKey = decode(secret, params.passphrase);
    const { r, s, v } = signEcdsa(params.message, privateKey);
    const sig = `${_.padStart(r, 64, "0")}${_.padStart(s, 64, "0")}${_.padStart(
        v.toString(16),
        2,
        "0"
    )}`;
    return sig;
}

export async function save(
    context: Context,
    params: {
        keyType: KeyType;
    }
): Promise<SecretStorage[]> {
    return await context.db.get(getTableName(params.keyType)).value();
}

export async function load(
    context: Context,
    value: SecretStorage[],
    params: {
        keyType: KeyType;
    }
): Promise<void> {
    return context.db.set(getTableName(params.keyType), value).write();
}
