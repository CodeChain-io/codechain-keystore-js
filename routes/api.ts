import * as express from "express";
import { Context } from "../context";

export function createRouter(context: Context) {
    const router = express.Router();

    router.post("/hi", async (req, res) => {
        res.json({
            message: "HI"
        });
    });

    return router;
}
