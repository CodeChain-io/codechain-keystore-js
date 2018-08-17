import { Context } from "../context";
import { asyncGet } from "./util";

export async function hi(context: Context): Promise<any | null> {
    const row: any = await asyncGet(context.db, "SELECT $x", {
        $x: 1
    });
    if (row === null) {
        return null;
    }
    return row;
}
