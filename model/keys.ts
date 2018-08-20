import { Context } from "context";
import { asyncGetAll } from "./util";
import * as _ from "lodash";

export async function getKeys(context: Context): Promise<string[]> {
    const rows = await asyncGetAll<{ publicKey: string }>(context.db, "SELECT publicKey FROM keys", {});
    if (rows === null) {
        return []
    }
    return _.map(rows, ({ publicKey }) => publicKey);
}
