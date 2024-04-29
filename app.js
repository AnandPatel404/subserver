import env from "dotenv";
env.config();
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import loggerapp from "debug";
import reconnect_session from "./utils/reconnect.js";

import moment from "moment";

// BULL QUEUE STUFFF
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import message_sending from "./bull/queue.js";

// IMPORT ALL MIDDILEARES
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

//IMPORT ALL ROUTES
import apiRoute from "./routes/api.route.js";

// IMPORTS ALL CUSTOM MIDDLEWARES
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const debug = loggerapp("app:server");
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.locals.moment = moment;
app.locals.format = new Intl.NumberFormat("en-IN").format;

// SETUP ALL MIDDLEWARES
app.use(morgan("dev"));
app.use(
	cors({
		credentials: true,
		origin: true,
	})
);

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

const serverAdapter = new ExpressAdapter();

const { router } = createBullBoard({
	queues: [
		new BullAdapter({
			message_sending,
		}),
	],
	serverAdapter: serverAdapter,
});
serverAdapter.setBasePath("/admin/manage_queue");

app.use("/", apiRoute);
app.use("/admin/manage_queue", serverAdapter.getRouter());
app.use(notFound);
app.use(errorHandler);

// Server Listen
const PORT = process.env.PORT;
app.listen(PORT, () => {
	reconnect_session();
	debug(`Server is listening on port ${PORT}`);
});
