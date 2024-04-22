const nodemailer = require('nodemailer')
const catchAsync = require('./catchAsync')

const sendEmail = async (options) => {
	//1) Create a transporter
	const transporter = nodemailer.createTransport({
		//service: 'Gmail', yahoo, hotmail, etc
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
		//Activate in gmail "less secure app" option - Only 500 emails per day
	})

	//2) Define the email options
	const mailOptions = {
		from: 'Lisan Andia <lisandroandia14@gmail.com>',
		to: options.email,
		subject: options.subject,
		text: options.message,
		//html:
	}

	//3) Send the email
	await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
