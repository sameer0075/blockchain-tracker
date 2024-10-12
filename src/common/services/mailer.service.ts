import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPlainTextEmail(to: string, subject: string, text: string) {
    await this.mailerService.sendMail({
      to, // Recipient email
      subject, // Email subject
      text, // Plain text content
    });
  }
}
