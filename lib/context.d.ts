import * as Lowdb from "lowdb";
export interface Context {
    db: Lowdb.LowdbAsync<any>;
}
export declare function createContext(params: {
    useMemoryDB: boolean;
    dbPath: string;
    debug?: boolean;
}): Promise<Context>;
export declare function closeContext(context: Context): Promise<void>;
