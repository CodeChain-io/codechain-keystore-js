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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var keys_1 = require("../logic/keys");
var keys_2 = require("../model/keys");
var cckey;
beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, index_1.CCKey.create({ useMemoryDB: true })];
            case 1:
                cckey = _a.sent();
                return [2 /*return*/];
        }
    });
}); });
afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        cckey.close();
        return [2 /*return*/];
    });
}); });
test("platform.importRaw", function () { return __awaiter(_this, void 0, void 0, function () {
    var privateKey, key, publicKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                privateKey = "a05f81608217738d99da8fd227897b87e8890d3c9159b559c7c8bbd408e5fb6e";
                return [4 /*yield*/, cckey.platform.importRaw({
                        privateKey: privateKey,
                        passphrase: "satoshi"
                    })];
            case 1:
                key = _a.sent();
                publicKey = "0eb7cad828f1b48c97571ac5fde6add42a7f9285a204291cdc2a03007480dc70639d80c57d80ba6bb02fc2237fec1bb357e405e13b7fb8ed4f947fd8f4900abd";
                expect(key).toBe(keys_1.keyFromPublicKey(keys_2.KeyType.Platform, publicKey));
                return [2 /*return*/];
        }
    });
}); });
test("platform.importKey", function () { return __awaiter(_this, void 0, void 0, function () {
    var secret, key, publicKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                secret = {
                    crypto: {
                        ciphertext: "80e5af055f9ecf4a7a851045db47cddd80d9d2554989fa02ca833b5ee2e29b5e1508e0895dad386bc6e7187c4352854900fd9ac1827a8895adb9ce195bc7e009",
                        cipherparams: { iv: "0212752ab377bbaf42f660689d7711ec" },
                        cipher: "aes-128-ctr",
                        kdf: "pbkdf2",
                        kdfparams: {
                            dklen: 32,
                            salt: "b4090e3a7aff620aa18df490feb24d882efc4373e643c91d810d58758f0ff47a",
                            c: 262144,
                            prf: "hmac-sha256"
                        },
                        mac: "54ba7bfd7f0d527f172c7bc4db08d0e876d17c240cf2a39ce34e8e434efc1543"
                    },
                    id: "374348c6-3eda-4bec-8365-6966ce884210",
                    version: 3
                };
                return [4 /*yield*/, cckey.platform.importKey({
                        secret: secret,
                        passphrase: "satoshi"
                    })];
            case 1:
                key = _a.sent();
                publicKey = "0eb7cad828f1b48c97571ac5fde6add42a7f9285a204291cdc2a03007480dc70639d80c57d80ba6bb02fc2237fec1bb357e405e13b7fb8ed4f947fd8f4900abd";
                expect(key).toBe(keys_1.keyFromPublicKey(keys_2.KeyType.Platform, publicKey));
                return [2 /*return*/];
        }
    });
}); });
test("platform.exportKey", function () { return __awaiter(_this, void 0, void 0, function () {
    var privateKey, key, storage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                privateKey = "a05f81608217738d99da8fd227897b87e8890d3c9159b559c7c8bbd408e5fb6e";
                return [4 /*yield*/, cckey.platform.importRaw({
                        privateKey: privateKey,
                        passphrase: "satoshi"
                    })];
            case 1:
                key = _a.sent();
                return [4 /*yield*/, cckey.platform.exportKey({
                        key: key,
                        passphrase: "satoshi"
                    })];
            case 2:
                storage = _a.sent();
                expect(storage).toHaveProperty("crypto");
                expect(storage.crypto).toHaveProperty("cipher");
                expect(storage.crypto).toHaveProperty("cipherparams");
                expect(storage.crypto).toHaveProperty("ciphertext");
                expect(storage.crypto).toHaveProperty("kdf");
                expect(storage.crypto).toHaveProperty("kdfparams");
                expect(storage.crypto).toHaveProperty("mac");
                return [2 /*return*/];
        }
    });
}); });
test("platform.exportRawKey", function () { return __awaiter(_this, void 0, void 0, function () {
    var privateKey, key, exportedPrivateKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                privateKey = "a05f81608217738d99da8fd227897b87e8890d3c9159b559c7c8bbd408e5fb6e";
                return [4 /*yield*/, cckey.platform.importRaw({
                        privateKey: privateKey,
                        passphrase: "satoshi"
                    })];
            case 1:
                key = _a.sent();
                return [4 /*yield*/, cckey.platform.exportRawKey({
                        key: key,
                        passphrase: "satoshi"
                    })];
            case 2:
                exportedPrivateKey = _a.sent();
                expect(exportedPrivateKey).toBe(privateKey);
                return [2 /*return*/];
        }
    });
}); });
test("platform.createKey", function () { return __awaiter(_this, void 0, void 0, function () {
    var key;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cckey.platform.createKey({ passphrase: "satoshi" })];
            case 1:
                key = _a.sent();
                expect(key).toBeTruthy();
                expect(key.length).toBe(40);
                return [2 /*return*/];
        }
    });
}); });
test("platform.createKey with an empty passphrase", function () { return __awaiter(_this, void 0, void 0, function () {
    var key;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cckey.platform.createKey({ passphrase: "" })];
            case 1:
                key = _a.sent();
                expect(key).toBeTruthy();
                expect(key.length).toBe(40);
                return [2 /*return*/];
        }
    });
}); });
test("platform.getKeys", function () { return __awaiter(_this, void 0, void 0, function () {
    var keys, key1, key2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cckey.platform.getKeys()];
            case 1:
                keys = _a.sent();
                expect(keys.length).toBe(0);
                return [4 /*yield*/, cckey.platform.createKey({ passphrase: "satoshi" })];
            case 2:
                key1 = _a.sent();
                return [4 /*yield*/, cckey.platform.createKey({ passphrase: "satoshi" })];
            case 3:
                key2 = _a.sent();
                return [4 /*yield*/, cckey.platform.getKeys()];
            case 4:
                keys = _a.sent();
                expect(keys).toEqual([key1, key2]);
                return [2 /*return*/];
        }
    });
}); });
test("platform.deleteKey", function () { return __awaiter(_this, void 0, void 0, function () {
    var key1, key2, originPublicKey2, keys, publicKey1, publicKey2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cckey.platform.createKey({ passphrase: "satoshi" })];
            case 1:
                key1 = _a.sent();
                return [4 /*yield*/, cckey.platform.createKey({ passphrase: "satoshi" })];
            case 2:
                key2 = _a.sent();
                return [4 /*yield*/, cckey.platform.getPublicKey({ key: key2 })];
            case 3:
                originPublicKey2 = _a.sent();
                return [4 /*yield*/, cckey.platform.deleteKey({ key: key1 })];
            case 4:
                _a.sent();
                return [4 /*yield*/, cckey.platform.getKeys()];
            case 5:
                keys = _a.sent();
                expect(keys).toEqual([key2]);
                return [4 /*yield*/, cckey.platform.getPublicKey({
                        key: key1
                    })];
            case 6:
                publicKey1 = _a.sent();
                return [4 /*yield*/, cckey.platform.getPublicKey({
                        key: key2
                    })];
            case 7:
                publicKey2 = _a.sent();
                expect(publicKey1).toEqual(null);
                expect(publicKey2).toEqual(originPublicKey2);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=cckey.spec.js.map