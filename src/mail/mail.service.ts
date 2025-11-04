import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';

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

  private getTemplate(templateName: string, context: Record<string, any>) {
    const filePath = path.join(process.cwd(), 'src', 'mail', 'templates', `${templateName}.html`); // src/mail/templates/reset.html
    const source = fs.readFileSync(filePath, 'utf8');
    const compiled = handlebars.compile(source);
    return compiled(context);
  }

  async sendMail(type: 'reset' | 'verify' | 'welcome', to: string, data: Record<string, any>) {
    const subjects = {
      reset: 'Reset your password',
      verify: 'Verify your account',
      welcome: 'Welcome to our app!',
    };

    const html = this.getTemplate(type, data);

    await this.transporter.sendMail({
      to,
      from: 'Support" <support@example.com>',
      subject: subjects[type],
      html,
    });
  }
}
