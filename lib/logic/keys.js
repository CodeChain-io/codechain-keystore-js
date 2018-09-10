"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var classes_1 = require("codechain-sdk/lib/core/classes");
var utils_1 = require("codechain-sdk/lib/utils");
var keys_1 = require("../model/keys");
var KeysModel = require("../model/keys");
var MappingModel = require("../model/mapping");
var error_1 = require("./error");
function getKeys(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var publicKeys;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, KeysModel.getKeys(context, params)];
                case 1:
                    publicKeys = _a.sent();
                    return [2 /*return*/, publicKeys.map(function (publicKey) {
                            return keyFromPublicKey(params.keyType, publicKey);
                        })];
            }
        });
    });
}
exports.getKeys = getKeys;
function importRaw(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var publicKey, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, KeysModel.importRaw(context, params)];
                case 1:
                    publicKey = _a.sent();
                    key = keyFromPublicKey(params.keyType, publicKey);
                    MappingModel.add(context, {
                        key: key,
                        value: publicKey
                    });
                    return [2 /*return*/, key];
            }
        });
    });
}
exports.importRaw = importRaw;
function exportKey(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var publicKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, MappingModel.getPublicKey(context, params)];
                case 1:
                    publicKey = _a.sent();
                    if (publicKey === null) {
                        throw new error_1.KeystoreError(error_1.ErrorCode.NoSuchKey);
                    }
                    return [2 /*return*/, KeysModel.exportKey(context, {
                            passphrase: params.passphrase,
                            keyType: params.keyType,
                            publicKey: publicKey
                        })];
            }
        });
    });
}
exports.exportKey = exportKey;
function importKey(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var publicKey, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, KeysModel.importKey(context, params)];
                case 1:
                    publicKey = _a.sent();
                    key = keyFromPublicKey(params.keyType, publicKey);
                    MappingModel.add(context, {
                        key: key,
                        value: publicKey
                    });
                    return [2 /*return*/, key];
            }
        });
    });
}
exports.importKey = importKey;
function exportRawKey(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var publicKey, newParams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, MappingModel.getPublicKey(context, params)];
                case 1:
                    publicKey = _a.sent();
                    if (publicKey === null) {
                        throw new error_1.KeystoreError(error_1.ErrorCode.NoSuchKey);
                    }
                    newParams = __assign({}, params, { publicKey: publicKey });
                    return [2 /*return*/, KeysModel.exportRawKey(context, newParams)];
            }
        });
    });
}
exports.exportRawKey = exportRawKey;
function createKey(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var publicKey, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, KeysModel.createKey(context, params)];
                case 1:
                    publicKey = _a.sent();
                    key = keyFromPublicKey(params.keyType, publicKey);
                    MappingModel.add(context, {
                        key: key,
                        value: publicKey
                    });
                    return [2 /*return*/, key];
            }
        });
    });
}
exports.createKey = createKey;
function keyFromPublicKey(type, publicKey) {
    switch (type) {
        case keys_1.KeyType.Platform:
            return utils_1.getAccountIdFromPublic(publicKey);
        case keys_1.KeyType.Asset:
            return classes_1.H256.ensure(utils_1.blake256(publicKey)).value;
        default:
            throw new Error("Invalid key type");
    }
}
exports.keyFromPublicKey = keyFromPublicKey;
function deleteKey(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var publicKey, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, MappingModel.getPublicKey(context, params)];
                case 1:
                    publicKey = _a.sent();
                    if (publicKey === null) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, KeysModel.deleteKey(context, {
                            keyType: params.keyType,
                            publicKey: publicKey
                        })];
                case 2:
                    result = _a.sent();
                    if (result) {
                        MappingModel.remove(context, {
                            key: params.key
                        });
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.deleteKey = deleteKey;
function sign(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var publicKey, newParams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, MappingModel.getPublicKey(context, params)];
                case 1:
                    publicKey = _a.sent();
                    if (publicKey === null) {
                        throw new error_1.KeystoreError(error_1.ErrorCode.NoSuchKey);
                    }
                    newParams = __assign({}, params, { publicKey: publicKey });
                    return [2 /*return*/, KeysModel.sign(context, newParams)];
            }
        });
    });
}
exports.sign = sign;
//# sourceMappingURL=keys.js.map