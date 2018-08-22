import * as sqlite3 from "sqlite3";
import { asyncRun } from "./util";

export async function initialize(db: sqlite3.Database): Promise<void> {
    // TODO: need index in createdAt and url
    await asyncRun(db,
        `CREATE TABLE IF NOT EXISTS platform_keys (
id INTEGER PRIMARY KEY ASC,
encryptedPrivateKey TEXT,
publicKey TEXT
)`, {});

    await asyncRun(db,
        `CREATE TABLE IF NOT EXISTS asset_keys (
id INTEGER PRIMARY KEY ASC,
encryptedPrivateKey TEXT,
publicKey TEXT
)`, {});

    await asyncRun(db,
        `CREATE TABLE IF NOT EXISTS pkhs (
id INTEGER PRIMARY KEY ASC,
hash TEXT,
publicKey TEXT
)`, {});
}
