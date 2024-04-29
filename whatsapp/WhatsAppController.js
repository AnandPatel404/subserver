import {
	useMultiFileAuthState,
	makeWASocket,
	DisconnectReason,
	Browsers,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import {
	createSessionInStore,
	hasSession,
	destroySession,
} from "../store/store.js";
import logger from "debug";
const debug = logger("whatsapp-backend:server");
import fs from "fs";
import path from "path";
import got from "got";

class Whatsapp {
	constructor() {
		this.qr = null;
		this.id = null;
	}

	async init(id) {
		this.id = id;
	}

	async update_session() {
		await got.post(`${process.env.CALLBACK}/active-session`, {
			json: {
				id: this.id,
				status: "active",
			},
		});
	}

	async disconnect() {
		try {
			const is_file_exist = fs.existsSync(
				path.join(process.cwd(), `sessions/auth_info_baileys_${this.id}`)
			);
			if (is_file_exist) {
				fs.rmSync(
					path.join(process.cwd(), `sessions/auth_info_baileys_${this.id}`),
					{
						recursive: true,
						force: true,
					}
				);

				const session_exist = await hasSession(this.id);

				if (session_exist) {
					await destroySession(this.id);
				}
				return true;
			} else {
				throw new Error("Session is already disconnected");
			}
		} catch (error) {
			console.error("[e] Whatsapp Disconnect Error", error);
			throw new Error(error.message);
		}
	}

	async create_session(retry = 0) {
		try {
			const { state, saveCreds } = await useMultiFileAuthState(
				`sessions/auth_info_baileys_${this.id}`
			);

			const sock = makeWASocket({
				auth: state,
				printQRInTerminal:
					process.env.NODE_ENV === "development" ? true : false,
				browser: Browsers.ubuntu("Chrome"),
				generateHighQualityLinkPreview: true,
				qrTimeout: 5 * 60 * 1000,
			});
			sock.ev.on("connection.update", (update) => {
				this.qr = update.qr;

				const { connection, lastDisconnect } = update;
				if (connection === "close") {
					const shouldReconnect =
						lastDisconnect.error instanceof Boom
							? lastDisconnect.error.output.statusCode !==
							  DisconnectReason.loggedOut
							: false;

					if (shouldReconnect) this.create_session();
				}
				if (connection === "open") {
					debug("opened connection");
					createSessionInStore(this.id, { socket: sock });
					debug("session is created");
					this.update_session(this.id);
				}
			});
			sock.ev.on("creds.update", saveCreds);
			return true;
		} catch (error) {
			console.error("[e] Whatsapp Create Session Error", error);
			throw new Error(
				`Currently Server Can't Connect to Whatsapp Please Try Again Later`
			);
		}
	}
}

export default Whatsapp;
