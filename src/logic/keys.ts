import { H256 } from "codechain-sdk/lib/core/classes";
import { blake256, getAccountIdFromPublic } from "codechain-sdk/lib/utils";
import { Context } from "../context";
import { KeyType } from "../model/keys";
import * as KeysModel from "../model/keys";
import * as MappingModel from "../model/mapping";
import { Key, PublicKey, SecretStorage } from "../types";
import { ErrorCode, KeystoreError } from "./error";

export async function getKeys(
    context: Context,
    params: { keyType: KeyType }
): Promise<Key[]> {
    const publicKeys = await KeysModel.getKeys(context, params);
    return publicKeys.map(publicKey =>
        keyFromPublicKey(params.keyType, publicKey)
    );
}

export async function importRaw(
    context: Context,
    params: { privateKey: string; passphrase?: string; keyType: KeyType }
): Promise<Key> {
    const publicKey = await KeysModel.importRaw(context, params);
    const key = keyFromPublicKey(params.keyType, publicKey);

    MappingModel.addMapping(context, {
        key,
        value: publicKey
    });

    return key;
}

export async function exportKey(
    context: Context,
    params: { key: string; passphrase: string; keyType: KeyType }
): Promise<SecretStorage> {
    const publicKey = await MappingModel.getPublicKey(context, params);
    if (publicKey === null) {
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
    const key = keyFromPublicKey(params.keyType, publicKey);

    MappingModel.addMapping(context, {
        key,
        value: publicKey
    });

    return key;
}

export async function createKey(
    context: Context,
    params: { passphrase?: string; keyType: KeyType }
): Promise<Key> {
    const publicKey = await KeysModel.createKey(context, params);
    const key = keyFromPublicKey(params.keyType, publicKey);

    MappingModel.addMapping(context, {
        key,
        value: publicKey
    });

    return key;
}

export function keyFromPublicKey(type: KeyType, publicKey: PublicKey): Key {
    switch (type) {
        case KeyType.Platform:
            return getAccountIdFromPublic(publicKey);
        case KeyType.Asset:
            return H256.ensure(blake256(publicKey)).value;
        default:
            throw new Error("Invalid key type");
    }
}

export async function deleteKey(
    context: Context,
    params: { key: Key; keyType: KeyType }
): Promise<boolean> {
    const publicKey = await MappingModel.getPublicKey(context, params);
    if (publicKey === null) {
        return false;
    }

    const result = await KeysModel.deleteKey(context, {
        keyType: params.keyType,
        publicKey
    });

    if (result) {
        MappingModel.removeMapping(context, {
            key: params.key
        });
    }

    return result;
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
    const publicKey = await MappingModel.getPublicKey(context, params);
    if (publicKey === null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    const newParams = { ...params, publicKey };
    return KeysModel.sign(context, newParams);
}
