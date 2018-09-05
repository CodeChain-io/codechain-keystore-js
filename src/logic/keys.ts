import { H256 } from "codechain-sdk/lib/core/classes";
import { blake256, getAccountIdFromPublic } from "codechain-sdk/lib/utils";
import { Context } from "../context";
import { KeyType } from "../model/keys";
import * as KeysModel from "../model/keys";
import * as MappingModel from "../model/mapping";
import { PublicKey } from "../types";

export async function createKey(
    context: Context,
    params: { passphrase?: string; keyType: KeyType }
): Promise<PublicKey> {
    const publicKey = await KeysModel.createKey(context, params);
    const mappingKey = getMappingKey(params.keyType, publicKey);

    MappingModel.addMapping(context, {
        key: mappingKey,
        value: publicKey
    });

    return publicKey;
}

function getMappingKey(type: KeyType, key: PublicKey): string {
    switch (type) {
        case KeyType.Platform:
            return getAccountIdFromPublic(key);
        case KeyType.Asset:
            return H256.ensure(blake256(key)).value;
        default:
            throw new Error("Invalid key type");
    }
}

export async function deleteKey(
    context: Context,
    params: { publicKey: PublicKey; keyType: KeyType }
): Promise<boolean> {
    const result = await KeysModel.deleteKey(context, params);

    if (result) {
        const key = getMappingKey(params.keyType, params.publicKey);
        MappingModel.removeMapping(context, {
            key
        });
    }

    return result;
}
