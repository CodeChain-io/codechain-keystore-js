import { Context } from "context";
import { asyncRun, asyncGetAll, asyncGet } from "./util";
import { generatePrivateKey, getPublicFromPrivate } from "codechain-sdk/lib/utils";
import { encrypt, decrypt } from "../logic/crypto";
import * as _ from "lodash";

interface Key {
    encryptedPrivateKey: string;
    publicKey: string;
}

export async function getKeys(context: Context): Promise<string[]> {
    const rows = await asyncGetAll<{ publicKey: string }>(context.db, "SELECT publicKey FROM keys", {});
    if (rows === null) {
        return []
    }
    return _.map(rows, ({ publicKey }) => publicKey);
}

export async function createKey(context: Context, params: { passphrase?: string } = {}): Promise<string> {
    const privateKey = generatePrivateKey();
    const publicKey = getPublicFromPrivate(privateKey);
    const passphrase = params.passphrase || "";

    const encryptedPrivateKey = encrypt(privateKey, passphrase);
    await insertKey(context, encryptedPrivateKey, publicKey);
    return publicKey;
}

async function insertKey(context: Context, encryptedPrivateKey: string, publicKey: string): Promise<void> {
    await asyncRun(context.db, "INSERT INTO keys (encryptedPrivateKey, publicKey) VALUES ($encryptedPrivateKey, $publicKey)", {
        $encryptedPrivateKey: encryptedPrivateKey,
        $publicKey: publicKey
    });
}

export async function deleteKey(context: Context, params: { publicKey: string, passphrase: string }): Promise<boolean> {
    const key = await getKey(context, params);
    if (key === null) {
        console.log(`Key not found for ${params.publicKey}`);
        return false;
    }

    try {
        decrypt(key.encryptedPrivateKey, params.passphrase);
    } catch (err) {
        console.log(`Decryption failed ${err}`);
        return false;
    }

    await removeKey(context, params);
    return true;
}

async function getKey(context: Context, params: { publicKey: string }): Promise<Key | null> {
    const key = await asyncGet<Key>(context.db, "SELECT * FROM keys WHERE publicKey=$publicKey", {
        $publicKey: params.publicKey
    });

    return key;
}

async function removeKey(context: Context, params: { publicKey: string }): Promise<void> {
    await asyncRun(context.db, "DELETE FROM keys WHERE publicKey=$publicKey", {
        $publicKey: params.publicKey
    });
}
