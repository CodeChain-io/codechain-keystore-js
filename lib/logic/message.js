"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var error_1 = require("./error");
function errorMessage(context, error) {
    switch (error.code) {
        case error_1.ErrorCode.Unknown:
            return "Unknown server error. Please retry after some minuates later";
        default:
            console.error("Invalid error code " + error.code);
            return "Unknown server error. Please retry some minuates later";
    }
}
exports.errorMessage = errorMessage;
//# sourceMappingURL=message.js.map