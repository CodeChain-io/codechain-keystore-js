import { Context } from "../context";
import { PrivateKey, PublicKey, SecretStorage } from "../types";
export declare enum KeyType {
    Platform = 0,
    Asset = 1
}
export declare function getKeys(context: Context, params: {
    keyType: KeyType;
}): Promise<PublicKey[]>;
export declare function importRaw(context: Context, params: {
    privateKey: PrivateKey;
    passphrase?: string;
    keyType: KeyType;
}): Promise<PublicKey>;
export declare function exportKey(context: Context, params: {
    publicKey: PublicKey;
    passphrase: string;
    keyType: KeyType;
}): Promise<SecretStorage>;
export declare function importKey(context: Context, params: {
    secret: SecretStorage;
    passphrase: string;
    keyType: KeyType;
}): Promise<PublicKey>;
export declare function createKey(context: Context, params: {
    passphrase?: string;
    keyType: KeyType;
}): Promise<PublicKey>;
export declare function deleteKey(context: Context, params: {
    publicKey: PublicKey;
    keyType: KeyType;
}): Promise<boolean>;
export declare function exportRawKey(context: Context, params: {
    publicKey: PublicKey;
    passphrase: string;
    keyType: KeyType;
}): Promise<string>;
export declare function sign(context: Context, params: {
    publicKey: PublicKey;
    message: string;
    passphrase: string;
    keyType: KeyType;
}): Promise<string>;
