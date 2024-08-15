const Service = require("node-windows").Service;

const svc = new Service({
	name: "Email API OMNIA",
	description: "Email API for hitting the email server",
	script: `${__dirname}\\bin\\www`,
	maxRetries: 3,
});

svc.on("install", () => {
	svc.start();
});

svc.on("uninstall", () => {
	console.log("uninstall berhasil");
});

// svc.install();
// svc.uninstall();
