import { Context } from "../context";
import { asyncRun, asyncGet } from "./util";
import { blake256 } from "codechain-sdk/lib/utils";
import { H256 } from "codechain-sdk/lib/core/classes";

interface PKH {
    hash: string;
    publicKey: string;
}

export async function insertPKH(context: Context, params: { publicKey: string }): Promise<string> {
    const hash = H256.ensure(blake256(params.publicKey)).value;
    await asyncRun(context.db, "INSERT INTO pkhs (hash, publicKey) VALUES ($hash, $publicKey)", {
        $hash: hash,
        $publicKey: params.publicKey
    });
    return hash;
}

export async function getPKH(context: Context, params: { hash: string }): Promise<string | null> {
    const row = await asyncGet<PKH>(context.db, "SELECT * FROM pkhs WHERE hash=$hash", {
        $hash: params.hash
    });
    if (row === null) {
        return null;
    }
    return row.publicKey;
}
