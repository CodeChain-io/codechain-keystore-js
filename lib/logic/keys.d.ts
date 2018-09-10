import { Context } from "../context";
import { KeyType } from "../model/keys";
import { Key, PrivateKey, PublicKey, SecretStorage } from "../types";
export declare function getKeys(context: Context, params: {
    keyType: KeyType;
}): Promise<Key[]>;
export declare function importRaw(context: Context, params: {
    privateKey: PrivateKey;
    passphrase?: string;
    keyType: KeyType;
}): Promise<Key>;
export declare function exportKey(context: Context, params: {
    key: Key;
    passphrase: string;
    keyType: KeyType;
}): Promise<SecretStorage>;
export declare function importKey(context: Context, params: {
    secret: SecretStorage;
    passphrase: string;
    keyType: KeyType;
}): Promise<Key>;
export declare function exportRawKey(context: Context, params: {
    key: Key;
    passphrase: string;
    keyType: KeyType;
}): Promise<Key>;
export declare function createKey(context: Context, params: {
    passphrase?: string;
    keyType: KeyType;
}): Promise<Key>;
export declare function keyFromPublicKey(type: KeyType, publicKey: PublicKey): Key;
export declare function deleteKey(context: Context, params: {
    key: Key;
    keyType: KeyType;
}): Promise<boolean>;
export declare function sign(context: Context, params: {
    key: Key;
    message: string;
    passphrase: string;
    keyType: KeyType;
}): Promise<string>;
