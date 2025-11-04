export default () => ({
	port: parseInt(process.env.PORT, 10) || 3000,
	database: {
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT, 10) || 5432,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRATION || '7d',
	},
	mail: {
		host: process.env.MAIL_HOST,
		port: parseInt(process.env.MAIL_PORT, 10) || 587,
		user: process.env.MAIL_USER,
		password: process.env.MAIL_PASSWORD,
		from: process.env.MAIL_FROM,
	},
	whatsapp: {
		sessionPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-session',
	},
	defaults: {
		agePromotionThresholdMonths:
			parseInt(process.env.DEFAULT_AGE_PROMOTION_THRESHOLD_MONTHS, 10) || 6,
		conferencePrerequisiteServices:
			parseInt(process.env.DEFAULT_CONFERENCE_PREREQUISITE_SERVICES, 10) || 1,
		participantListGenerationWeeks:
			parseInt(process.env.DEFAULT_PARTICIPANT_LIST_GENERATION_WEEKS, 10) || 3,
		annualMonitorContribution: parseInt(process.env.ANNUAL_MONITOR_CONTRIBUTION, 10) || 12000,
	},
});
