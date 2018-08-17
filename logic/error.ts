export enum ErrorCode {
    Unknown = 0,
}

export class KeystoreError extends Error {
    public code: ErrorCode;
    public codeName: string;
    public name: string;
    public internal: Error | null;
    public internalString: string;

    constructor(code: ErrorCode, internal: Error | null) {
        super(ErrorCode[code]);
        this.code = code;
        this.codeName = ErrorCode[code];
        this.name = "FaucetError";
        this.internal = internal;
        this.internalString = String(internal);
    }
}
