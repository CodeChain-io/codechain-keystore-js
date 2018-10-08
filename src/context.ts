import * as Lowdb from "lowdb";
import lowdb = require("lowdb");
import { initialize as dbInitialize } from "./model/initialize";

declare var window: any;
function isBrowser() {
    return typeof window !== "undefined";
}

const persistentAdapter = isBrowser()
    ? require("lowdb/adapters/LocalStorage")
    : require("lowdb/adapters/FileSync");

export interface Context {
    db: Lowdb.LowdbAsync<any>;
}

export async function createContext(params: {
    useMemoryDB: boolean;
    dbPath: string;
    debug?: boolean;
}): Promise<Context> {
    const adapter = params.useMemoryDB
        ? require("lowdb/adapters/Memory")
        : persistentAdapter;
    const db = await lowdb(new adapter(params.dbPath));

    await dbInitialize(db);

    return {
        db
    };
}

export async function closeContext(context: Context): Promise<void> {
    return Promise.resolve();
}
