import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

export interface SendResult {
    success: boolean;
    recipient: string;
    error?: string;
}

@Injectable()
export class WhatsAppService implements OnModuleInit {
    private readonly logger = new Logger(WhatsAppService.name);
    private client: Client;
    private isReady = false;
    private qrGenerated = false;

    async onModuleInit() {
        await this.initialize();
    }

    async initialize() {
        this.logger.log('Initializing WhatsApp client...');

        this.client = new Client({
            authStrategy: new LocalAuth({
                dataPath: '.wwebjs_auth',
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                ],
            },
        });

        this.client.on('qr', (qr) => {
            if (!this.qrGenerated) {
                this.logger.log('QR Code received. Scan with WhatsApp:');
                qrcode.generate(qr, { small: true });
                this.qrGenerated = true;
            }
        });

        this.client.on('ready', () => {
            this.logger.log('WhatsApp client is ready!');
            this.isReady = true;
            this.qrGenerated = false;
        });

        this.client.on('authenticated', () => {
            this.logger.log('WhatsApp client authenticated');
        });

        this.client.on('auth_failure', (msg) => {
            this.logger.error('WhatsApp authentication failed:', msg);
            this.isReady = false;
        });

        this.client.on('disconnected', (reason) => {
            this.logger.warn('WhatsApp client disconnected:', reason);
            this.isReady = false;
        });

        try {
            await this.client.initialize();
        } catch (error) {
            this.logger.error('Failed to initialize WhatsApp client:', error);
        }
    }

    isClientReady(): boolean {
        return this.isReady;
    }

    async sendMessage(to: string, message: string): Promise<boolean> {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        try {
            // Format phone number (remove spaces, dashes, etc.)
            const formattedNumber = this.formatPhoneNumber(to);

            // Send message
            await this.client.sendMessage(formattedNumber, message);

            this.logger.log(`Message sent successfully to ${formattedNumber}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send message to ${to}:`, error);
            return false;
        }
    }

    async sendBulkMessages(
        recipients: Array<{ phone: string; name: string }>,
        message: string,
    ): Promise<SendResult[]> {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        const results: SendResult[] = [];

        for (const recipient of recipients) {
            try {
                const success = await this.sendMessage(recipient.phone, message);
                results.push({
                    success,
                    recipient: recipient.name,
                    error: success ? undefined : 'Failed to send message',
                });

                // Add delay between messages to avoid rate limiting
                await this.delay(2000);
            } catch (error) {
                results.push({
                    success: false,
                    recipient: recipient.name,
                    error: error.message,
                });
            }
        }

        return results;
    }

    private formatPhoneNumber(phone: string): string {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // If number doesn't start with country code, add default (adjust as needed)
        if (!cleaned.startsWith('351')) {
            // Portugal country code
            cleaned = '351' + cleaned;
        }

        // Add @c.us suffix for WhatsApp
        return cleaned + '@c.us';
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async getClientInfo() {
        if (!this.isReady) {
            return {
                ready: false,
                message: 'WhatsApp client is not ready',
            };
        }

        try {
            const info = this.client.info;
            return {
                ready: true,
                info: {
                    pushname: info.pushname,
                    platform: info.platform,
                    phone: info.wid.user,
                },
            };
        } catch (error) {
            return {
                ready: false,
                message: 'Failed to get client info',
                error: error.message,
            };
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.destroy();
            this.isReady = false;
            this.logger.log('WhatsApp client disconnected');
        }
    }
}
