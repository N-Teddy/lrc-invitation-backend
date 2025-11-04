import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsAppService implements OnModuleInit {
	private client: Client;
	private isReady = false;

	constructor(private configService: ConfigService) {
		this.client = new Client({
			authStrategy: new LocalAuth({
				dataPath: this.configService.get('WHATSAPP_SESSION_PATH'),
			}),
			puppeteer: {
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
				executablePath: '/usr/bin/google-chrome',
			},
		});

		this.client.on('qr', (qr) => {
			console.log('WhatsApp QR Code:');
			qrcode.generate(qr, { small: true });
		});

		this.client.on('ready', () => {
			console.log('WhatsApp client is ready!');
			this.isReady = true;
		});

		this.client.on('authenticated', () => {
			console.log('WhatsApp authenticated');
		});

		this.client.on('auth_failure', (msg) => {
			console.error('WhatsApp authentication failed:', msg);
		});
	}

	async onModuleInit() {
		try {
			await this.client.initialize();
		} catch (error) {
			console.error('Failed to initialize WhatsApp client:', error);
		}
	}

	async sendMessage(phoneNumber: string, message: string): Promise<void> {
		if (!this.isReady) {
			throw new Error('WhatsApp client is not ready');
		}

		try {
			// Format phone number (remove + and spaces)
			const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
			const chatId = `${formattedNumber}@c.us`;

			await this.client.sendMessage(chatId, message);
		} catch (error) {
			console.error('WhatsApp message sending failed:', error);
			throw error;
		}
	}

	async sendParticipantListMessage(
		monitorPhone: string,
		activityTitle: string,
		participants: any[]
	): Promise<void> {
		const message = `
*Participant List for ${activityTitle}*

Total Participants: ${participants.length}
Meeting Requirements: ${participants.filter((p) => p.meetsRequirements).length}
Conditional: ${participants.filter((p) => !p.meetsRequirements).length}

*Participants:*
${participants
	.map(
		(p, index) =>
			`${index + 1}. ${p.childFirstName} ${p.childLastName} (${p.childAge}y, ${p.childAgeGroup})
   Parent: ${p.parentName} - ${p.parentPhone}
   Status: ${p.meetsRequirements ? '✅ Meets Requirements' : '⚠️ Conditional'}
   Reason: ${p.reasonForInclusion}`
	)
	.join('\n\n')}
    `.trim();

		await this.sendMessage(monitorPhone, message);
	}

	isClientReady(): boolean {
		return this.isReady;
	}
}
