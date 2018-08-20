import * as express from "express";
import { Context } from "../context";
import { health } from "../model/keys";

export function createRouter(context: Context) {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            await health(context);
            res.json({
                success: true,
            });
        } catch (err) {
            res.json({
                success: false,
                error: err
            });
        }
    });

    return router;
}
