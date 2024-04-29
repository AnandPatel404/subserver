import fs from "fs/promises"; // Assuming you're using Node.js 16+ for fs.promises
import Path from "path";
import { getSession } from "../store/store.js";
import url from "url";

async function send_message(job, done) {
	try {
		const { api_session_key, mobile_no, message, country_code } = job.data;

		const session = await getSession(api_session_key || process.env.API_KEY);

		try {
			await session.socket.sendMessage(
				`${country_code}${mobile_no}@s.whatsapp.net`,
				{
					text: message,
				}
			);
			// if (img) {
			// 	await session.socket.sendMessage(`91${to}@s.whatsapp.net`, {
			// 		image: { url: img },
			// 		caption: msg,
			// 	});
			// }

			// else if (message.video) {
			// 	const videoPath = Path.join(process.cwd(), "public", message.video);
			// 	const videoData = await fs.readFile(videoPath);
			// 	await session.socket.sendMessage(`91${to}@s.whatsapp.net`, {
			// 		video: videoData,
			// 		caption: mes,
			// 	});
			// } else if (message.pdf) {
			// 	const pdfPath = Path.join(process.cwd(), "public", message.pdf);
			// 	const pdfData = await fs.readFile(pdfPath);
			// 	await session.socket.sendMessage(`91${to}@s.whatsapp.net`, {
			// 		document: pdfData,
			// 		caption: msg,
			// 		mimetype: "application/pdf",
			// 	});
			// }
			done(null, "Message sent");
		} catch (error) {
			done(new Error(`Error sending message: ${error.message}`));
		}
	} catch (error) {
		done(new Error(`Error processing job: ${error.message}`));
	}
}

export default send_message;
