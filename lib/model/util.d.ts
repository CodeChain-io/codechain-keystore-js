import * as sqlite3 from "sqlite3";
export declare function asyncRun(db: sqlite3.Database, sql: string, params: any): Promise<void>;
export declare function asyncGet<T>(db: sqlite3.Database, sql: string, params: any): Promise<T | null>;
export declare function asyncGetAll<T>(db: sqlite3.Database, sql: string, params: any): Promise<T[] | null>;
