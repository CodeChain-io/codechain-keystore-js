import { Context } from "../context";
import { generatePrivateKey, getPublicFromPrivate, signEcdsa } from "codechain-sdk/lib/utils";
import { encrypt, decrypt } from "../logic/crypto";
import * as _ from "lodash";
import { KeystoreError, ErrorCode } from "../logic/error";

interface Key {
    encryptedPrivateKey: string;
    publicKey: string;
}

export enum KeyType {
    Platform,
    Asset
}

function getTableName(type: KeyType) {
    switch (type) {
        case KeyType.Platform:
            return "platform_keys";
        case KeyType.Asset:
            return "asset_keys";
        default:
            throw new Error("Invalid key type");
    }
}

export async function getKeys(context: Context, params: { keyType: KeyType }): Promise<string[]> {
    const rows: any = await context.db.get(getTableName(params.keyType)).value();
    return _.map(rows, ({ publicKey }) => publicKey);
}

export async function createKey(context: Context, params: { passphrase?: string, keyType: KeyType }, ): Promise<string> {
    const privateKey = generatePrivateKey();
    const publicKey = getPublicFromPrivate(privateKey);
    const passphrase = params.passphrase || "";

    const encryptedPrivateKey = encrypt(privateKey, passphrase);
    const rows = context.db.get(getTableName(params.keyType));
    await rows.push({
        encryptedPrivateKey,
        publicKey
    }).write();
    return publicKey;
}

export async function deleteKey(context: Context, params: { publicKey: string, keyType: KeyType }): Promise<boolean> {
    const key = await getKey(context, params);
    if (key === null) {
        console.log(`Key not found for ${params.publicKey}`);
        return false;
    }

    await removeKey(context, params);
    return true;
}

async function getKey(context: Context, params: { publicKey: string, keyType: KeyType }): Promise<Key | null> {
    const collection = context.db.get(getTableName(params.keyType));
    const row = await collection.find({ publicKey: params.publicKey }).value();

    if (!row) {
        return null;
    } else {
        return row as Key;
    }
}

async function removeKey(context: Context, params: { publicKey: string, keyType: KeyType }): Promise<void> {
    const collection = context.db.get(getTableName(params.keyType));
    await collection.remove({ publicKey: params.publicKey }).write();
}

export async function sign(context: Context, params: { publicKey: string, message: string, passphrase: string, keyType: KeyType }): Promise<string> {
    const key = await getKey(context, params);
    if (key === null) {
        throw new KeystoreError(ErrorCode.KeyNotExist, null);
    }

    const privateKey = decrypt(key.encryptedPrivateKey, params.passphrase);
    const { r, s, v } = signEcdsa(params.message, privateKey);
    const sig = `${_.padStart(r, 64, "0")}${_.padStart(s, 64, "0")}${_.padStart(v.toString(16), 2, "0")}`;
    return sig;
}
