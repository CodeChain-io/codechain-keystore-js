import { blake160, getAccountIdFromPublic, H160 } from "codechain-primitives";
import { Context } from "../context";
import { KeyType } from "../model/keys";
import * as KeysModel from "../model/keys";
import { Key, PrivateKey, PublicKey, SecretStorage } from "../types";
import { ErrorCode, KeystoreError } from "./error";

export async function getKeys(
    context: Context,
    params: { keyType: KeyType }
): Promise<Key[]> {
    const publicKeys = await KeysModel.getPublicKeys(context, params);
    return publicKeys.map(publicKey =>
        keyFromPublicKey(params.keyType, publicKey)
    );
}

export async function getPublicKey(
    context: Context,
    params: { key: Key; keyType: KeyType }
): Promise<PublicKey | null> {
    const publicKeys = await KeysModel.getPublicKeys(context, params);
    return (
        publicKeys.find(
            publicKey =>
                params.key === keyFromPublicKey(params.keyType, publicKey)
        ) || null
    );
}
export async function importRaw(
    context: Context,
    params: {
        privateKey: PrivateKey;
        passphrase?: string;
        keyType: KeyType;
        meta?: string;
    }
): Promise<Key> {
    const publicKey = await KeysModel.importRaw(context, params);
    return keyFromPublicKey(params.keyType, publicKey);
}

export async function exportKey(
    context: Context,
    params: { key: Key; passphrase: string; keyType: KeyType }
): Promise<SecretStorage> {
    const publicKey = await getPublicKey(context, params);
    if (publicKey == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    return KeysModel.exportKey(context, {
        passphrase: params.passphrase,
        keyType: params.keyType,
        publicKey
    });
}

export async function importKey(
    context: Context,
    params: { secret: SecretStorage; passphrase: string; keyType: KeyType }
): Promise<Key> {
    const publicKey = await KeysModel.importKey(context, params);
    return keyFromPublicKey(params.keyType, publicKey);
}

export async function exportRawKey(
    context: Context,
    params: { key: Key; passphrase: string; keyType: KeyType }
): Promise<Key> {
    const publicKey = await getPublicKey(context, params);
    if (publicKey == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    const newParams = { ...params, publicKey };
    return KeysModel.exportRawKey(context, newParams);
}

export async function createKey(
    context: Context,
    params: { passphrase?: string; keyType: KeyType }
): Promise<Key> {
    const publicKey = await KeysModel.createKey(context, params);
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
    const publicKey = await getPublicKey(context, params);
    if (publicKey == null) {
        return false;
    }

    return await KeysModel.deleteKey(context, {
        keyType: params.keyType,
        publicKey
    });
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
    const publicKey = await getPublicKey(context, params);
    if (publicKey == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    const newParams = { ...params, publicKey };
    return KeysModel.sign(context, newParams);
}
