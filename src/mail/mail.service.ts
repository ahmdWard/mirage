import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    await this.transporter.sendMail({
      from: `"Mirage " <${process.env.MAIL_USER}>`,
      to,
      subject: 'reset Email',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 10 min.</p>
      `,
    });
  }
}
