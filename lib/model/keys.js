"use strict";
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
var utils_1 = require("codechain-sdk/lib/utils");
var crypto_1 = require("../logic/crypto");
var _ = require("lodash");
var error_1 = require("../logic/error");
var KeyType;
(function (KeyType) {
    KeyType[KeyType["Platform"] = 0] = "Platform";
    KeyType[KeyType["Asset"] = 1] = "Asset";
})(KeyType = exports.KeyType || (exports.KeyType = {}));
function getTableName(type) {
    switch (type) {
        case KeyType.Platform:
            return "platform_keys";
        case KeyType.Asset:
            return "asset_keys";
        default:
            throw new Error("Invalid key type");
    }
}
function getKeys(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, context.db.get(getTableName(params.keyType)).value()];
                case 1:
                    rows = _a.sent();
                    return [2 /*return*/, _.map(rows, function (_a) {
                            var publicKey = _a.publicKey;
                            return publicKey;
                        })];
            }
        });
    });
}
exports.getKeys = getKeys;
function createKey(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var privateKey, publicKey, passphrase, encryptedPrivateKey, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    privateKey = utils_1.generatePrivateKey();
                    publicKey = utils_1.getPublicFromPrivate(privateKey);
                    passphrase = params.passphrase || "";
                    encryptedPrivateKey = crypto_1.encrypt(privateKey, passphrase);
                    rows = context.db.get(getTableName(params.keyType));
                    return [4 /*yield*/, rows.push({
                            encryptedPrivateKey: encryptedPrivateKey,
                            publicKey: publicKey
                        }).write()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, publicKey];
            }
        });
    });
}
exports.createKey = createKey;
function deleteKey(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getKey(context, params)];
                case 1:
                    key = _a.sent();
                    if (key === null) {
                        console.log("Key not found for " + params.publicKey);
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, removeKey(context, params)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.deleteKey = deleteKey;
function getKey(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var collection, row;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    collection = context.db.get(getTableName(params.keyType));
                    return [4 /*yield*/, collection.find({ publicKey: params.publicKey }).value()];
                case 1:
                    row = _a.sent();
                    if (!row) {
                        return [2 /*return*/, null];
                    }
                    else {
                        return [2 /*return*/, row];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function removeKey(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var collection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    collection = context.db.get(getTableName(params.keyType));
                    return [4 /*yield*/, collection.remove({ publicKey: params.publicKey }).write()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function sign(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var key, privateKey, _a, r, s, v, sig;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getKey(context, params)];
                case 1:
                    key = _b.sent();
                    if (key === null) {
                        throw new error_1.KeystoreError(error_1.ErrorCode.KeyNotExist, null);
                    }
                    privateKey = crypto_1.decrypt(key.encryptedPrivateKey, params.passphrase);
                    _a = utils_1.signEcdsa(params.message, privateKey), r = _a.r, s = _a.s, v = _a.v;
                    sig = "" + _.padStart(r, 64, "0") + _.padStart(s, 64, "0") + _.padStart(v.toString(16), 2, "0");
                    return [2 /*return*/, sig];
            }
        });
    });
}
exports.sign = sign;
//# sourceMappingURL=keys.js.map