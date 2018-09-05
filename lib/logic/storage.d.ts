import { SecretStorage } from "..";
export declare function encode(privateKey: string, passphrase: string): string;
export declare function decode(json: SecretStorage, passphrase: string): string;
