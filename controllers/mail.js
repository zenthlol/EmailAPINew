const nodemailer = require("nodemailer");
const logger = require("../loogging/logger");
const cron = require('node-cron');
const { response } = require("../app");
const { deleteMostRecentFile } = require('../uploadCleanse'); // deletion job


require("dotenv").config();


// =============================================

const transporter = nodemailer.createTransport({
	host: process.env.HOST_DEV.toString(),
	port: process.env.PORT_DEV.toString(),
	secure: false,
	tls: {
		rejectUnauthorized: false,
	},
	logger: false,
});

let responseVar = null; // place holder for response

const sendMail = (req, res) => {
	// scheduler.schedule
	const { email, subject, html, schedule } = req.body;
	let cc = req.body.cc;
	let bcc = req.body.bcc;
	const contentType = req.headers['content-type'];

	// console.log(contentType);
	
	const executionWithTryCatch = () => {
		//try catch
		try {
			// Email
			if (
				email === "" ||
				email === " " ||
				email === null ||
				email === undefined
			) {
				responseVar = 400;
				res.status(400).json({ msg: "Kolom email harus diisi" });
				throw new Error("Kolom Email tidak boleh kosong");
			} 

			// Subject
			else if (
				subject === "" ||
				subject === " " ||
				subject === null ||
				subject === undefined
			) {
				responseVar = 400;
				res.status(400).json({ msg: "Subject email harus diisi" });
				throw new Error("Untuk email kepada: " + req.body.email + ", Kolom Subject tidak boleh kosong");
			}
			
			// HTML 
			else if (
				html === "" ||
				html === " " ||
				html === null ||
				html === undefined
			) {
				responseVar = 400;
				res.status(400).json({ msg: "Body email tidak boleh kosong" });
				throw new Error("Untuk email kepada: " + req.body.email + ", Tidak ada data yang di kirim");
				
			}

			// HTML VALIDATION
			const containsHTML = /<[a-z][\s\S]*>/i.test(html);

			if (!containsHTML) {
				responseVar = 400;
				return res.status(400).json({ msg: "Invalid input: content bukan html" });
			}

			// SUBJECT VALIDATION
			let subjectValidation = true;

			if (subject === null || subject === undefined || subject === " ") {
				subjectValidation = false;
			}

			if (!subjectValidation) {
				responseVar = 400;
				return res
					.status(400)
					.json({ msg: "Invalid input: Subject tidak valid" });
			}


			// EMAIL VALIDATION
			const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			let emailValidation = true;
			const emailString = email;
			
			let emails;
			if(contentType.startsWith("multipart/form-data")){
				emails = emailString.split(',').map(email => email.trim());
			} else{
				emails = emailString;
			}
			

			// console.log(emails);

			emails.forEach((email) => {
				if (!emailRegex.test(email)) {
					emailValidation = false;
				}
			});

			if (emailValidation == false) {
				responseVar = 400;
				return res
					.status(400)
					.json({ msg: "Invalid input: format email salah" });
			}
			
			
			if (cc == ""){
				console.log("cc is empty");
			}

			//CC VALIDATION
			if (cc !== undefined && cc !== "" && cc !== null) {
				let ccValidation = true;
				const ccString = cc;

				console.log("hi");
				let ccs;
				if(contentType.startsWith("multipart/form-data")){
					ccs = ccString.split(',').map(cc => cc.trim());
				} else{
					ccs = ccString;
				}
				
				
				ccs.forEach((cc) => {
					if (!emailRegex.test(cc)) {
						ccValidation = false;
					}

				});

				if (!ccValidation) {
					responseVar = 400;
					return res
						.status(400)
						.json({ msg: "Invalid input: format CC salah" });
				}
			}
			

			// BCC VALIDATION
			if (bcc !== undefined && bcc !== "" && bcc !== null) {
				let bccValidation = true;
				const bccString = bcc;

				let bccs;
				if(contentType.startsWith("multipart/form-data")){
					bccs = bccString.split(',').map(bcc => bcc.trim());
				} else{
					bccs = bccString;
				}
				

				bccs.forEach((bcc) => {
					if (!emailRegex.test(bcc)) {
						bccValidation = false;		
					}

				});

				if (!bccValidation) {
					responseVar = 400;
					return res
						.status(400)
						.json({ msg: "Invalid input: format BCC salah" });
				}
			}

			

			


			// PUSH ATTACHMENTS & MAX SIZE VALIDATION
			const attachments = [];

			if (req.files !== undefined && req.files !== null){
				for (const file of req.files) {
					attachments.push({
						filename: file.originalname,
						path: file.path
					});
				}

				let totalSize = 0;
				req.files.forEach(file => {
					totalSize += file.size;
				});
				
				if (totalSize > 10 * 1024 * 1024) {
					responseVar = 400;
					res.status(400).send({ msg: 'Ukuran file attachment melebihi 10 MB' });
					throw new Error("Ukuran file attachment melebihi 10 MB");
				}
			}

			if (cc !== undefined) {
				cc = cc;
			} else{
				cc = null;
			}

			if (bcc !== undefined) {
				cc = cc;
			} else{
				bcc = null;
			}

			const content = {
				from: 'noreply-halobca@bca.co.id',

				to: req.body.email,

				cc: cc,

				bcc: bcc,

				subject: req.body.subject,

				html: req.body.html,

				attachments: attachments
			};

			
			// NO SCHEDULE
			if (schedule == undefined || schedule == null) { //jika sender tidak menjadwalkan email
				//langsung kirim data email
					transporter.verify((err, success) => {
						if (err) {
							// console.log("from verify");
							// console.log(err);
							logger.error(err);
							throw new Error("error content tidak valid");
							// res.status(400).json({ error: err });
						} else {
							console.log(`success: ${success}`);
							// logger.info(`success: ${success}`)
		
							const mailInfo = transporter.sendMail(content, (err, info) => {
								if (err) {
									// if (err.responseCode === undefined) {
									// 	throw new Error("Data tidak valid");
									// }
								z	// console.log(err.responseCode);
		
									logger.error(err);
									if (err.responseCode === undefined) {
										responseVar = 400;
										return res.status(400).json(err);
									} else {
										responseVar = 400;
										return res.status(err.responseCode).json(err);
									}
									
								} else {
									let response = {
										info: info,
									};		
									logger.info(response);
									responseVar = 200;
									return res.status(200).json(response);
								}
							});
						}
					});	
			}
			
			// HAS SCHEDULE
			else{
				// SCHEDULE VALIDATION
				const scheduleRegex =  /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
				
				let scheduleValidation = true;
				const scheduleString = schedule;

				if (!scheduleRegex.test(scheduleString)) {
					scheduleValidation = false;
				}
				
				if (scheduleValidation == false) {
					responseVar = 400;
					return res
						.status(400)
						.json({ msg: "Invalid input: format schedule salah" });
				}
				else{
					console.log('Trying to schedule an email at ' + schedule + '  || minute hour date month day-of-week');
					
					// start scheduing email
					cron.schedule(schedule, () => {
						
						transporter.verify((err, success) => {
							if (err) {
								// console.log("from verify");
								// console.log(err);
								logger.error(err);
								throw new Error("error content tidak valid");
								// res.status(400).json({ error: err });
							} else {
								console.log(`success: ${success}`);
								// logger.info(`success: ${success}`)
			
								const mailInfo = transporter.sendMail(content, (err, info) => {
									if (err) {
										logger.error(err);
										if (err.responseCode === undefined) {
											responseVar = 400;
											return res.status(400).json(err);
										} else {
											responseVar = res.status(err.responseCode);
											return res.status(err.responseCode).json(err);
										}
										
									} else {
										let response = {
											info: info,
										};		
										logger.info(response);
										responseVar = 200;
										return res.status(200).json(response);
									}
								});
							}
						});
						console.log("SCHEDULED EMAIL SENT: at " + schedule + " !")
					})
					
					responseVar = 200;
					return res.status(200).json({
						info: {
						  accepted: [
							req.body.email, cc, bcc
						  ],
						  rejected: [],
						  envelopeTime: 0,
						  messageTime: 0,
						  messageSize: 0,
						  response: "Email telah dijadwalkan pada waktu " + schedule,
						  envelope: {
							from: "noreply-callbacksoladesk@bca.co.id",
							to: [
							  req.body.email, cc, bcc
							]
						  },
						  messageId: "0"
						}
					  });
				}
			}

		} catch (error) {
			logger.error(error);
			console.log
			responseVar = 400;
			return res.status(400).json({ msg: error });
		}
		// const paths = path.join(__dirname, "..", "views", "email.ejs");


		// Code to Execute File Deletion in Uploads Folder for Failed Requests
		console.log("response var is " + responseVar);
		if(responseVar != 200){
			const directoryPath = './uploads';
			deleteMostRecentFile(directoryPath);
		}
	}
	executionWithTryCatch();
};

// todo: create send mail
module.exports = { sendMail, responseVar };
