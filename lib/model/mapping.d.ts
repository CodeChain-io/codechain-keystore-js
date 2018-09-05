import { Context } from "../context";
import { Key, PublicKey } from "../types";
export declare function add(context: Context, params: {
    key: Key;
    value: PublicKey;
}): Promise<void>;
export declare function remove(context: Context, params: {
    key: Key;
}): Promise<void>;
export declare function getPublicKey(context: Context, params: {
    key: Key;
}): Promise<PublicKey | null>;
