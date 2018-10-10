import * as Lowdb from "lowdb";
import lowdb = require("lowdb");
import { initialize as dbInitialize } from "./model/initialize";

declare var window: any;
function isBrowser() {
    return typeof window !== "undefined";
}

const memoryAdapter = require("lowdb/adapters/Memory");
const persistentAdapter = isBrowser()
    ? require("lowdb/adapters/LocalStorage")
    : require("lowdb/adapters/FileSync");
const volatileAdapter = isBrowser()
    ? require("lowdb-session-storage-adapter")
    : memoryAdapter;

export interface Context {
    db: Lowdb.LowdbAsync<any>;
}

function getAdapter(dbType: string) {
    switch (dbType) {
        case "persistent":
            return persistentAdapter;
        case "volatile":
            return volatileAdapter;
        case "in-memory":
            return memoryAdapter;
        default:
            throw new Error(`Not expected type: ${dbType}`);
    }
}

export async function createContext(params: {
    dbType: string;
    dbPath: string;
    debug?: boolean;
}): Promise<Context> {
    const adapter = getAdapter(params.dbType);
    const db = await lowdb(new adapter(params.dbPath));

    await dbInitialize(db);

    return {
        db
    };
}

export async function closeContext(context: Context): Promise<void> {
    return Promise.resolve();
}
