export declare enum ErrorCode {
    Unknown = 0,
    NoSuchKey = 1,
    DecryptionFailed = 2,
    DBError = 3
}
export declare class KeystoreError extends Error {
    code: ErrorCode;
    codeName: string;
    name: string;
    constructor(code: ErrorCode);
}
