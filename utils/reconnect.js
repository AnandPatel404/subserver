import fs from "fs";
import path from "path";
import Whatsapp from "../whatsapp/WhatsAppController.js";
async function re_connect() {
	const is_file_exist = fs.existsSync(
		path.join(
			process.cwd(),
			`sessions/auth_info_baileys_${process.env.API_KEY}`
		)
	);
	if (is_file_exist) {
		const instance_whatsapp = new Whatsapp();
		await instance_whatsapp.init(process.env.API_KEY);
		await instance_whatsapp.create_session();
	}
}

export default re_connect;
