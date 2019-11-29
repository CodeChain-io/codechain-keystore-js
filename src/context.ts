import * as Lowdb from "lowdb";
import lowdb = require("lowdb");
import * as os from "os";
import { clear as hdClear } from "./model/hdkeys";
import { initialize as dbInitialize } from "./model/initialize";
import { clear } from "./model/keys";
import { KeyType } from "./model/keytypes";

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

export async function storageExist(params: {
    dbType: string;
    dbPath: string;
}): Promise<boolean> {
    const db = await lowdb(getAdapter(params));
    const meta = db.get("meta").value();
    const platform = db.get(KeyType.Platform).value();
    const asset = db.get(KeyType.Asset).value();
    const hdwseed = db.get(KeyType.HDWSeed).value();

    return (
        (meta != null && meta !== "") ||
        (platform != null && platform.length !== 0) ||
        (asset != null && asset.length !== 0) ||
        (hdwseed != null && hdwseed.length !== 0)
    );
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
        await clear(context, { keyType: KeyType.Asset });
        await clear(context, { keyType: KeyType.Platform });
        await hdClear(context);
    }
    return Promise.resolve(context.db.write());
}
