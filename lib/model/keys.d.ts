import { SecretStorage } from "..";
import { Context } from "../context";
export declare enum KeyType {
    Platform = 0,
    Asset = 1
}
export declare function getKeys(context: Context, params: {
    keyType: KeyType;
}): Promise<string[]>;
export declare function importRaw(context: Context, params: {
    privateKey: string;
    passphrase?: string;
    keyType: KeyType;
}): Promise<string>;
export declare function exportKey(context: Context, params: {
    publicKey: string;
    passphrase: string;
    keyType: KeyType;
}): Promise<SecretStorage>;
export declare function importKey(context: Context, params: {
    secret: SecretStorage;
    passphrase: string;
    keyType: KeyType;
}): Promise<string>;
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
