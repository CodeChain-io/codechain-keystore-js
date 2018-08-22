import { Context } from "../context";
export declare function insertPKH(context: Context, params: {
    publicKey: string;
}): Promise<string>;
export declare function getPKH(context: Context, params: {
    hash: string;
}): Promise<string | null>;
