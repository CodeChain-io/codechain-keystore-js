import * as express from "express";
import { Context } from "../context";
import { getKeys, createKey, deleteKey, signKey } from "../model/keys";
import { insertPKH, getPKH } from "../model/pkhs";

export function createRouter(context: Context) {
    const router = express.Router();

    router.get("/keys", async (req, res) => {
        const keys = await getKeys(context);

        res.json({
            success: true,
            result: keys
        });
    });

    router.post("/keys", async (req, res) => {
        const { passphrase } = req.body;
        const publicKey = await createKey(context, { passphrase });
        res.json({
            success: true,
            result: publicKey
        });
    });

    router.post("/keys/:key/remove", async (req, res) => {
        const { key } = req.params;
        const { passphrase = "" } = req.body;
        const result = await deleteKey(context, { publicKey: key, passphrase });
        res.json({
            success: true,
            result
        });
    });

    router.post("/keys/:key/sign", async (req, res) => {
        try {
            const { key } = req.params;
            const { message, passphrase = "" } = req.body;
            const result = await signKey(context, { publicKey: key, passphrase, message });
            res.json({
                success: true,
                result
            });
        } catch (e) {
            res.json({
                success: false,
                error: e
            });
        }
    });

    router.post("/pkhs", async (req, res) => {
        const { publicKey } = req.body;
        const hash = await insertPKH(context, { publicKey });
        res.json({
            success: true,
            result: hash
        });
    });

    router.get("/pkhs/:hash", async (req, res) => {
        const { hash } = req.params;
        const publicKey = await getPKH(context, { hash });
        res.json({
            success: true,
            result: publicKey
        });
    });

    return router;
}
