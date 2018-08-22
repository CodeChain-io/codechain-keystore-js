import { Context } from "../context";
import { asyncRun, asyncGet } from "./util";

interface Mapping {
    key: string;
    value: string;
}

export async function addMapping(context: Context, params: { key: string; value: string; }): Promise<void> {
    await asyncRun(context.db, "INSERT INTO mapping (key, value) VALUES ($key, $value)", {
        $value: params.value,
        $key: params.key
    });
}

export async function getMapping(context: Context, params: { key: string }): Promise<string | null> {
    const row = await asyncGet<Mapping>(context.db, "SELECT * FROM mapping WHERE key=$key", {
        $key: params.key
    });
    if (row === null) {
        return null;
    }
    return row.value;
}
