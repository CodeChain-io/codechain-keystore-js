import { Context } from "../context";
import { ErrorCode, KeystoreError } from "./error";

export function errorMessage(context: Context, error: KeystoreError): string {
    switch (error.code) {
        case ErrorCode.Unknown:
            return "Unknown server error. Please retry after some minuates later";
        default:
            console.error("Invalid error code " + error.code);
            return "Unknown server error. Please retry some minuates later";
    }
}
