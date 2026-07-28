import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create the transporter using environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: parseInt(process.env.SMTP_PORT || '465', 10) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private get frontendUrl(): string {
    return process.env.FRONTEND_URL || 'https://goldtradingboot.shop';
  }

  private get fromAddress(): string {
    return process.env.SMTP_FROM || `"Gold Trading Bot" <${process.env.SMTP_USER}>`;
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.fromAddress,
      to,
      subject: 'Réinitialisation de votre mot de passe - Gold Trading Bot',
      html: `
        <div style="font-family: Arial, sans-serif; max-w-xl mx-auto p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 style="color: #D4AF37;">Réinitialisation de mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe sur Gold Trading Bot.</p>
          <p>Veuillez cliquer sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #D4AF37; color: black; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Réinitialiser mon mot de passe</a>
          </div>
          <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        </div>
      `,
    };

    try {
      if (!process.env.SMTP_USER) {
        this.logger.warn(`Email system not fully configured (missing SMTP_USER). Simulated email to ${to}`);
        this.logger.debug(`Reset Link: ${resetLink}`);
        return;
      }
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error.stack);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const mailOptions = {
      from: this.fromAddress,
      to,
      subject: 'Bienvenue sur Gold Trading Bot !',
      html: `
        <div style="font-family: Arial, sans-serif; max-w-xl mx-auto p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 style="color: #D4AF37;">Bienvenue ${name || ''} !</h2>
          <p>Merci de vous être inscrit sur Gold Trading Bot.</p>
          <p>Vous pouvez dès maintenant accéder à votre tableau de bord pour découvrir nos solutions de trading automatisé pour MetaTrader 5.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.frontendUrl}/dashboard" style="background-color: #D4AF37; color: black; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Accéder à mon tableau de bord</a>
          </div>
          <p>À très bientôt,<br/>L'équipe Gold Trading Bot</p>
        </div>
      `,
    };

    try {
      if (!process.env.SMTP_USER) {
        this.logger.warn(`Email system not fully configured. Simulated welcome email to ${to}`);
        return;
      }
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error.stack);
    }
  }
}
