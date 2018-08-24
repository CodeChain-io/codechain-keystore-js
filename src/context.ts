import * as lowdb from "lowdb";
import { initialize as dbInitialize } from "./model/initialize";

declare var window: any;
function isBrowser() {
    return typeof window === "undefined";
}

const persistentAdapter = isBrowser() ? require("lowdb/adapters/FileSync") : require("lowdb/adapters/LocalStorage");

export interface Context {
    db: lowdb.LowdbAsync<any>
}

export async function createContext(params: { useMemoryDB: boolean, dbPath: string, debug?: boolean }): Promise<Context> {
    const adapter = params.useMemoryDB ? require("lowdb/adapters/Memory") : persistentAdapter;
    const db = await lowdb(new adapter(params.dbPath));

    await dbInitialize(db);

    return {
        db
    }
}

export async function closeContext(context: Context): Promise<void> {
    return Promise.resolve();
}
