export enum ErrorCode {
    Unknown = 0,
    NoSuchKey = 1,
    NoSuchSeedHash = 2,
    DecryptionFailed = 3,
    DBError = 4,
    WrongSeedLength = 5,
    WrongMnemonicString = 6
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
