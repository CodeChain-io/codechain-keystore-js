import * as createError from "http-errors";
import * as express from "express";
import * as path from "path";
import * as logger from "morgan";
const morganBody = require("morgan-body");

import { createRouter as createApiRouter } from "./routes/api";
import { createRouter as createPingRouter } from "./routes/ping";
import { createContext, Context } from "./context";

export async function createApp(): Promise<[express.Application, Context]> {
    const app = express();

    // view engine setup
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "pug");

    app.use(logger("dev"));
    app.use(express.json());
    app.use(express.static(path.join(__dirname, "public")));
    morganBody(app);

    const context = await createContext();
    app.use("/api", createApiRouter(context));
    app.use("/ping", createPingRouter(context));

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404));
    });

    // error handler
    app.use((err: any, req: express.Request, res: express.Response) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};
        console.error(err);

        // render the error page
        res.status(err.status || 500);
        res.render("error");
    });
    return [app, context];
}


