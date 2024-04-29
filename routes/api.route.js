import express from "express";
import Whatsapp from "../whatsapp/WhatsAppController.js";
import { toDataURL } from "qrcode";
import message_sending from "../bull/queue.js";
const router = express.Router();
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/* GET users listing. */
router.get("/qr", async function (req, res, next) {
	try {
		let counter = 0;
		let isError = false;

		const whatsApp = new Whatsapp();
		await whatsApp.init(process.env.API_KEY);
		await whatsApp.create_session();

		while (whatsApp.qr === null) {
			if (counter === 8) {
				isError = true;
				break;
			}
			await sleep(4000);
			counter++;
		}

		if (isError) {
			return res.status(400).json({
				msg: "Session is not created Please Try Again Later",
			});
		}

		const final = await toDataURL(whatsApp.qr);

		return res.status(200).json({
			status: "success",
			data: final,
		});
	} catch (error) {
		res.status(400).json({
			msg: error.message,
			status: "error",
			error: true,
		});
	}
});
router.post("/send-message", async function (req, res, next) {
	try {
		let newObj = {
			api_session_key: process.env.API_KEY,
			...req.body,
		};

		// TODO : SENDING SEQUNCE NOTADD
		message_sending.add("message_sending", newObj, {
			// delay: rand[random],
			removeOnComplete: true,
			removeOnFail: true,
		});

		return res.status(200).json({
			status: "success",
			msg: "Message Add To Queue",
		});
	} catch (error) {
		res.status(400).json({
			msg: error.message,
			status: "error",
			error: true,
		});
	}
});

router.post("/disconnect", async function (req, res, next) {
	try {
		const whatsApp = new Whatsapp();
		await whatsApp.init(process.env.API_KEY);
		await whatsApp.disconnect();

		return res.status(200).json({
			status: "success",
			msg: "Message Add To Queue",
		});
	} catch (error) {
		res.status(400).json({
			msg: error.message,
			status: "error",
			error: true,
		});
	}
});

export default router;
