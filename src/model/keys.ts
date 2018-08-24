import { Context } from "../context";
import { asyncRun, asyncGetAll, asyncGet } from "./util";
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

export async function health(context: Context): Promise<void> {
    try {
        const result = await asyncGet<{ num: number }>(context.db, "SELECT 1 as num", {});
        if (result === null || result.num !== 1) {
            throw new KeystoreError(ErrorCode.DBError, null);
        }
    } catch (err) {
        if (err.name !== "KeystoreError") {
            throw new KeystoreError(ErrorCode.DBError, err);
        }
        throw err;
    }
}

export async function getKeys(context: Context, params: { keyType: KeyType }): Promise<string[]> {
    const rows = await asyncGetAll<{ publicKey: string }>(context.db, `SELECT publicKey FROM ${getTableName(params.keyType)}`, {});
    if (rows === null) {
        return []
    }
    return _.map(rows, ({ publicKey }) => publicKey);
}

export async function createKey(context: Context, params: { passphrase?: string, keyType: KeyType }, ): Promise<string> {
    const privateKey = generatePrivateKey();
    const publicKey = getPublicFromPrivate(privateKey);
    const passphrase = params.passphrase || "";

    const encryptedPrivateKey = encrypt(privateKey, passphrase);
    await insertKey(context, encryptedPrivateKey, publicKey, params.keyType);
    return publicKey;
}

async function insertKey(context: Context, encryptedPrivateKey: string, publicKey: string, keyType: KeyType): Promise<void> {
    await asyncRun(context.db, `INSERT INTO ${getTableName(keyType)} (encryptedPrivateKey, publicKey) VALUES ($encryptedPrivateKey, $publicKey)`, {
        $encryptedPrivateKey: encryptedPrivateKey,
        $publicKey: publicKey
    });
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
    const key = await asyncGet<Key>(context.db, `SELECT * FROM ${getTableName(params.keyType)} WHERE publicKey=$publicKey`, {
        $publicKey: params.publicKey
    });

    return key;
}

async function removeKey(context: Context, params: { publicKey: string, keyType: KeyType }): Promise<void> {
    await asyncRun(context.db, `DELETE FROM ${getTableName(params.keyType)} WHERE publicKey=$publicKey`, {
        $publicKey: params.publicKey
    });
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
