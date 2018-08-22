export declare enum ErrorCode {
    Unknown = 0,
    KeyNotExist = 1,
    DecryptionFailed = 2,
    DBError = 3
}
export declare class KeystoreError extends Error {
    code: ErrorCode;
    codeName: string;
    name: string;
    internal: Error | null;
    internalString: string;
    constructor(code: ErrorCode, internal: Error | null);
}
