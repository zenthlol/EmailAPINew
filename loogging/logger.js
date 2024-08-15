const { createLogger, format, transports } = require("winston");
const { combine, printf } = format;
const DailyRotateFile = require("winston-daily-rotate-file");

const formats = printf(({ level, message }) => {
	if (message.info === undefined) { //buat log kalo eror
		// default
		// return `${Date()} ${level.toUpperCase()}: ${message}`;

		// me
		return `${Date()} ${level.toUpperCase()}: ${
			message
		}`;
	} 
	
	else { // buat log kalo sukses
		return `${Date()} ${level.toUpperCase()}: accepted by: ${
			message.info.accepted
		}, send from: ${message.info.envelope.from}, response: ${
			message.info.response
		}, msgId: ${message.info.messageId}`;
	}
});

const logger = createLogger({
	level: "info",
	format: combine(formats),
	transports: [
		new DailyRotateFile({
			filename: "./log/email-%DATE%.log",
			datePattern: "DD-MM-YYYY",
			maxFiles: "7d",
		}),
		new DailyRotateFile({
			filename: "./log/error/email-error-%DATE%.log",
			datePattern: "DD-MM-YYYY",
			maxFiles: "7d",
			level: "error",
		}),
	],
});
 
module.exports = logger;
