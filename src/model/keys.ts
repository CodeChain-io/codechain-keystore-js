import {
    blake160,
    generatePrivateKey,
    getAccountIdFromPublic,
    getPublicFromPrivate,
    H160,
    signEcdsa
} from "codechain-primitives";
import * as _ from "lodash";
import { Context } from "../context";
import { ErrorCode, KeystoreError } from "../logic/error";
import { decode, encode } from "../logic/storage";
import { Key, PrivateKey, PublicKey, SecretStorage } from "../types";
import { KeyType } from "./keytypes";

export async function getKeys(
    context: Context,
    params: { keyType: KeyType }
): Promise<Key[]> {
    const rows: any = await context.db.get(params.keyType).value();
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
    const privateKey = await decode(secret, params.passphrase);
    return getPublicFromPrivate(privateKey);
}

export function importRaw(
    context: Context,
    params: {
        privateKey: PrivateKey;
        passphrase?: string;
        keyType: KeyType;
        meta?: string;
    }
): Promise<Key> {
    return createKeyFromPrivateKey(context, params);
}

export async function exportKey(
    context: Context,
    params: { key: Key; passphrase: string; keyType: KeyType }
): Promise<SecretStorage> {
    const secret = await getSecretStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    await decode(secret, params.passphrase); // Throws an error if the passphrase is incorrect.
    return secret;
}

export async function importKey(
    context: Context,
    params: { secret: SecretStorage; passphrase: string; keyType: KeyType }
): Promise<Key> {
    const privateKey = await decode(params.secret, params.passphrase);
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
): Promise<Key> {
    const privateKey = generatePrivateKey();
    return createKeyFromPrivateKey(context, {
        ...params,
        privateKey
    });
}

async function createKeyFromPrivateKey(
    context: Context,
    params: {
        privateKey: PrivateKey;
        passphrase?: string;
        keyType: KeyType;
        meta?: string;
    }
): Promise<Key> {
    const publicKey = getPublicFromPrivate(params.privateKey);
    const passphrase = params.passphrase || "";
    const meta = params.meta || "{}";

    const secret = await encode(
        params.privateKey,
        params.keyType,
        passphrase,
        meta
    );
    const rows: any = context.db.get(params.keyType);
    await rows.push(secret).write();
    return keyFromPublicKey(params.keyType, publicKey);
}

export function keyFromPublicKey(type: KeyType, publicKey: PublicKey): Key {
    switch (type) {
        case KeyType.Platform:
            return getAccountIdFromPublic(publicKey);
        case KeyType.Asset:
            return H160.ensure(blake160(publicKey)).value;
        default:
            throw new Error("Invalid key type");
    }
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
    const collection: any = context.db.get(params.keyType);
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
    const collection: any = context.db.get(params.keyType);
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

    const privateKey = await decode(secret, params.passphrase);
    return signEcdsa(params.message, privateKey);
}

export async function getMeta(
    context: Context,
    params: { key: Key; keyType: KeyType }
): Promise<string> {
    const secret = await getSecretStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    return secret.meta;
}

export function save(
    context: Context,
    params: {
        keyType: KeyType;
    }
): Promise<SecretStorage[]> {
    return context.db.get(params.keyType).value();
}

export function load(
    context: Context,
    value: SecretStorage[],
    params: {
        keyType: KeyType;
    }
): Promise<void> {
    return context.db.set(params.keyType, value).write();
}

export async function clear(
    context: Context,
    params: { keyType: KeyType }
): Promise<void> {
    await context.db.unset(params.keyType).write();
}
