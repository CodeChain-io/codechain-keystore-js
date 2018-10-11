import { blake160, getAccountIdFromPublic, H160 } from "codechain-primitives";
import { Context } from "../context";
import { KeyType } from "../model/keys";
import * as KeysModel from "../model/keys";
import { Key, PrivateKey, PublicKey, SecretStorage } from "../types";

export async function getKeys(
    context: Context,
    params: { keyType: KeyType }
): Promise<Key[]> {
    return await KeysModel.getKeys(context, params);
}

export async function getPublicKey(
    context: Context,
    params: { key: Key; passphrase: string; keyType: KeyType }
): Promise<PublicKey | null> {
    return await KeysModel.getPublicKey(context, params);
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
    return KeysModel.exportKey(context, params);
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
    return KeysModel.exportRawKey(context, params);
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
    return await KeysModel.deleteKey(context, params);
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
    return KeysModel.sign(context, params);
}
