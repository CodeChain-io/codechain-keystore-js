"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["Unknown"] = 0] = "Unknown";
    ErrorCode[ErrorCode["KeyNotExist"] = 1] = "KeyNotExist";
    ErrorCode[ErrorCode["DecryptionFailed"] = 2] = "DecryptionFailed";
    ErrorCode[ErrorCode["DBError"] = 3] = "DBError";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
var KeystoreError = /** @class */ (function (_super) {
    __extends(KeystoreError, _super);
    function KeystoreError(code, internal) {
        var _this = _super.call(this, ErrorCode[code]) || this;
        _this.code = code;
        _this.codeName = ErrorCode[code];
        _this.name = "KeystoreError";
        _this.internal = internal;
        _this.internalString = String(internal);
        return _this;
    }
    return KeystoreError;
}(Error));
exports.KeystoreError = KeystoreError;
//# sourceMappingURL=error.js.map