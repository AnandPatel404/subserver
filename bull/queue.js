import Queue from "bull";
import debug from "debug";
import send_message from "./process.js";
import got from "got";
const logger = debug("whatsapp-backend:bull_queue:message_sending");

const message_sending = new Queue("message_sending", {
	redis: {
		port: 6379,
		host: "127.0.0.1",
		db: 3,
	},
});

message_sending.process("message_sending", send_message);

message_sending.on("completed", async (job) => {
	logger("complete", job);

	await got.post(`${process.env.CALLBACK}/call_back_from_server`, {
		json: {
			...job.data,
			status: "send",
			sendAt: new Date(),
		},
		responseType: "json",
	});

	return;
});
message_sending.on("failed", async (job) => {
	logger("failed", job);

	await got.post(`${process.env.CALLBACK}/call_back_from_server`, {
		json: {
			...job.data,
			status: "fail",
		},
		responseType: "json",
	});
});
message_sending.on("error", (job) => {
	logger("error", job);
});

export default message_sending;
