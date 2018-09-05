import { Context } from "../context";
import { Key, PublicKey } from "../types";

export async function addMapping(
    context: Context,
    params: { key: Key; value: PublicKey }
): Promise<void> {
    const collection = context.db.get("mapping");
    await collection.set(params.key, params.value).write();
}

export async function removeMapping(
    context: Context,
    params: { key: Key }
): Promise<void> {
    const collection = context.db.get("mapping");
    await collection.unset(params.key).write();
}

export async function getPublicKey(
    context: Context,
    params: { key: Key }
): Promise<PublicKey | null> {
    const collection = context.db.get("mapping");
    const value = await collection.get(params.key).value();

    if (value) {
        return value;
    } else {
        return null;
    }
}
