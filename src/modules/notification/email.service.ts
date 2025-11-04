import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
	private transporter: nodemailer.Transporter;

	constructor(private configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.get('MAIL_HOST'),
			port: this.configService.get('MAIL_PORT'),
			secure: false,
			auth: {
				user: this.configService.get('MAIL_USER'),
				pass: this.configService.get('MAIL_PASSWORD'),
			},
		});
	}

	async sendEmail(to: string, subject: string, html: string): Promise<void> {
		try {
			await this.transporter.sendMail({
				from: this.configService.get('MAIL_FROM'),
				to,
				subject,
				html,
			});
		} catch (error) {
			console.error('Email sending failed:', error);
			throw error;
		}
	}

	async sendParticipantListEmail(
		monitorEmail: string,
		activityTitle: string,
		participants: any[]
	): Promise<void> {
		const participantRows = participants
			.map(
				(p, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${p.childFirstName} ${p.childLastName}</td>
          <td>${p.childAge}</td>
          <td>${p.childAgeGroup}</td>
          <td>${p.parentName}</td>
          <td>${p.parentPhone}</td>
          <td>${p.meetsRequirements ? 'Yes' : 'No'}</td>
          <td>${p.reasonForInclusion}</td>
        </tr>
      `
			)
			.join('');

		const html = `
      <h2>Participant List for ${activityTitle}</h2>
      <p>Total Participants: ${participants.length}</p>
      <p>Meeting Requirements: ${participants.filter((p) => p.meetsRequirements).length}</p>
      <p>Conditional: ${participants.filter((p) => !p.meetsRequirements).length}</p>

      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>#</th>
            <th>Child Name</th>
            <th>Age</th>
            <th>Group</th>
            <th>Parent</th>
            <th>Phone</th>
            <th>Meets Requirements</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          ${participantRows}
        </tbody>
      </table>
    `;

		await this.sendEmail(monitorEmail, `Participant List - ${activityTitle}`, html);
	}
}
