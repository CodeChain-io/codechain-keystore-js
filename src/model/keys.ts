import {
    generatePrivateKey,
    getPublicFromPrivate,
    signEcdsa
} from "codechain-sdk/lib/utils";
import * as _ from "lodash";
import { Context } from "../context";
import { ErrorCode, KeystoreError } from "../logic/error";
import { decode, encode } from "../logic/storage";
import { PublicKey, SecretStorage } from "../types";

interface KeyPair {
    secret: string;
    publicKey: PublicKey;
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

export async function getKeys(
    context: Context,
    params: { keyType: KeyType }
): Promise<PublicKey[]> {
    const rows: any = await context.db
        .get(getTableName(params.keyType))
        .value();
    return _.map(rows, ({ publicKey }) => publicKey);
}

export function importRaw(
    context: Context,
    params: { privateKey: string; passphrase?: string; keyType: KeyType }
): Promise<PublicKey> {
    return createPublicKeyFromPrivateKey(context, params);
}

export async function exportKey(
    context: Context,
    params: { publicKey: PublicKey; passphrase: string; keyType: KeyType }
): Promise<SecretStorage> {
    const key = await getKeyPair(context, params);
    if (key === null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    const json = JSON.parse(key.secret);
    decode(json, params.passphrase); // Throws an error if the passphrase is incorrect.
    return json;
}

export async function importKey(
    context: Context,
    params: { secret: SecretStorage; passphrase: string; keyType: KeyType }
): Promise<PublicKey> {
    const privateKey = decode(params.secret, params.passphrase);
    return importRaw(context, {
        privateKey,
        passphrase: params.passphrase,
        keyType: params.keyType
    });
}

export function createKey(
    context: Context,
    params: { passphrase?: string; keyType: KeyType }
): Promise<PublicKey> {
    const privateKey = generatePrivateKey();
    return createPublicKeyFromPrivateKey(context, { ...params, privateKey });
}

async function createPublicKeyFromPrivateKey(
    context: Context,
    params: { privateKey: string; passphrase?: string; keyType: KeyType }
): Promise<PublicKey> {
    const publicKey = getPublicFromPrivate(params.privateKey);
    const passphrase = params.passphrase || "";

    const secret = encode(params.privateKey, passphrase);
    const rows = context.db.get(getTableName(params.keyType));
    await rows
        .push({
            secret,
            publicKey
        })
        .write();
    return publicKey;
}

export async function deleteKey(
    context: Context,
    params: { publicKey: PublicKey; keyType: KeyType }
): Promise<boolean> {
    const key = await getKeyPair(context, params);
    if (key === null) {
        return false;
    }

    await removeKey(context, params);
    return true;
}

async function getKeyPair(
    context: Context,
    params: { publicKey: PublicKey; keyType: KeyType }
): Promise<KeyPair | null> {
    const collection = context.db.get(getTableName(params.keyType));
    const row = await collection.find({ publicKey: params.publicKey }).value();

    if (!row) {
        return null;
    } else {
        return row as KeyPair;
    }
}

async function removeKey(
    context: Context,
    params: { publicKey: PublicKey; keyType: KeyType }
): Promise<void> {
    const collection = context.db.get(getTableName(params.keyType));
    await collection.remove({ publicKey: params.publicKey }).write();
}

export async function sign(
    context: Context,
    params: {
        publicKey: PublicKey;
        message: string;
        passphrase: string;
        keyType: KeyType;
    }
): Promise<string> {
    const key = await getKeyPair(context, params);
    if (key === null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }

    const privateKey = decode(JSON.parse(key.secret), params.passphrase);
    const { r, s, v } = signEcdsa(params.message, privateKey);
    const sig = `${_.padStart(r, 64, "0")}${_.padStart(s, 64, "0")}${_.padStart(
        v.toString(16),
        2,
        "0"
    )}`;
    return sig;
}
