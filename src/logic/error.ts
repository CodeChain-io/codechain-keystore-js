export enum ErrorCode {
    Unknown = 0,
    NoSuchKey = 1,
    DecryptionFailed = 2,
    DBError = 3
}

export class KeystoreError extends Error {
    public code: ErrorCode;
    public codeName: string;
    public name: string;

    constructor(code: ErrorCode) {
        super(ErrorCode[code]);
        this.code = code;
        this.codeName = ErrorCode[code];
        this.name = "KeystoreError";
    }
}
