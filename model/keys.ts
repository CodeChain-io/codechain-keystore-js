import { Context } from "context";
import { asyncRun, asyncGetAll } from "./util";
import { generatePrivateKey, getPublicFromPrivate } from "codechain-sdk/lib/utils";
import { encrypt } from "../logic/crypto";
import * as _ from "lodash";

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
