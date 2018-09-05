import { Context } from "../context";
import { Key, PublicKey } from "../types";
export declare function addMapping(context: Context, params: {
    key: Key;
    value: PublicKey;
}): Promise<void>;
export declare function removeMapping(context: Context, params: {
    key: Key;
}): Promise<void>;
export declare function getPublicKey(context: Context, params: {
    key: Key;
}): Promise<PublicKey | null>;
