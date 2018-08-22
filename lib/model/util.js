"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function asyncRun(db, sql, params) {
    return new Promise(function (resolve, reject) {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
exports.asyncRun = asyncRun;
function asyncGet(db, sql, params) {
    return new Promise(function (resolve, reject) {
        db.get(sql, params, function (err, row) {
            if (err) {
                reject(err);
                return;
            }
            if (typeof row === "undefined") {
                resolve(null);
            }
            else {
                resolve(row);
            }
        });
    });
}
exports.asyncGet = asyncGet;
function asyncGetAll(db, sql, params) {
    return new Promise(function (resolve, reject) {
        db.all(sql, params, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            if (typeof rows === "undefined") {
                resolve(null);
            }
            else {
                resolve(rows);
            }
        });
    });
}
exports.asyncGetAll = asyncGetAll;
//# sourceMappingURL=util.js.map