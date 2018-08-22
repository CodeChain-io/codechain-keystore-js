import * as sqlite3 from "sqlite3";
export interface Context {
    db: sqlite3.Database;
}
export declare function createContext(params: {
    useMemoryDB: boolean;
}): Promise<Context>;
export declare function closeContext(context: Context): Promise<void>;
