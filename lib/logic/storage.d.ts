import { SecretStorage } from "..";
import { PrivateKey } from "../types";
export declare function encode(privateKey: PrivateKey, passphrase: string): string;
export declare function decode(json: SecretStorage, passphrase: string): string;
