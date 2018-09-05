import { Context } from "../context";

export async function addMapping(
    context: Context,
    params: { key: string; value: string }
): Promise<void> {
    const collection = context.db.get("mapping");
    await collection.set(params.key, params.value).write();
}

export async function removeMapping(
    context: Context,
    params: { key: string }
): Promise<void> {
    const collection = context.db.get("mapping");
    await collection.unset(params.key).write();
}

export async function getMapping(
    context: Context,
    params: { key: string }
): Promise<string | null> {
    const collection = context.db.get("mapping");
    const value = await collection.get(params.key).value();

    if (value) {
        return value;
    } else {
        return null;
    }
}
