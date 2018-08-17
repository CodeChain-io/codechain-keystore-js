import * as express from "express";
import { Context } from "../context";

export function createRouter(context: Context) {
    const router = express.Router();

    router.get("/keys", async (req, res) => {
        res.json({
            message: "NotImplementedYet"
        });
    });

    router.post("/keys", async (req, res) => {
        res.json({
            message: "NotImplementedYet"
        });
    });

    router.post("/key/:key/remove", async (req, res) => {
        res.json({
            message: "NotImplementedYet"
        });
    });

    router.post("/key/:key/sign", async (req, res) => {
        res.json({
            message: "NotImplementedYet"
        });
    });

    router.post("/pubkeyhashes", async (req, res) => {
        res.json({
            message: "NotImplementedYet"
        });
    });

    router.get("/pubkeyhashes/:hash", async (req, res) => {
        res.json({
            message: "NotImplementedYet"
        });
    });

    return router;
}
