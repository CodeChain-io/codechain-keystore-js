import * as Lowdb from "lowdb";
import lowdb = require("lowdb");
import * as os from "os";
import { initialize as dbInitialize } from "./model/initialize";
import { getTableName, KeyType } from "./model/keys";

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
    : require("lowdb/adapters/FileSync");

export interface Context {
    db: Lowdb.LowdbAsync<any>;
    isVolatile: boolean;
}

function getAdapter(params: { dbPath: string; dbType: string }) {
    switch (params.dbType) {
        case "persistent":
            return new persistentAdapter(params.dbPath);
        case "volatile": {
            const dbPath = isBrowser()
                ? params.dbPath
                : `${os.tmpdir()}/${params.dbPath}`;
            return new volatileAdapter(dbPath);
        }
        case "in-memory":
            return new memoryAdapter(params.dbPath);
        default:
            throw new Error(`Not expected type: ${params.dbType}`);
    }
}

export async function createContext(params: {
    dbType: string;
    dbPath: string;
    debug?: boolean;
}): Promise<Context> {
    const db = await lowdb(getAdapter(params));

    await dbInitialize(db);

    return {
        db,
        isVolatile: params.dbType === "volatile"
    };
}

export async function closeContext(context: Context): Promise<void> {
    if (context.isVolatile) {
        await context.db.unset("meta").write();
        await context.db.unset(getTableName(KeyType.Platform)).write();
        await context.db.unset(getTableName(KeyType.Asset)).write();
    }
    return Promise.resolve(context.db.write());
}
