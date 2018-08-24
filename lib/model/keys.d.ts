import { Context } from "../context";
export declare enum KeyType {
    Platform = 0,
    Asset = 1
}
export declare function getKeys(context: Context, params: {
    keyType: KeyType;
}): Promise<string[]>;
export declare function createKey(context: Context, params: {
    passphrase?: string;
    keyType: KeyType;
}): Promise<string>;
export declare function deleteKey(context: Context, params: {
    publicKey: string;
    keyType: KeyType;
}): Promise<boolean>;
export declare function sign(context: Context, params: {
    publicKey: string;
    message: string;
    passphrase: string;
    keyType: KeyType;
}): Promise<string>;
