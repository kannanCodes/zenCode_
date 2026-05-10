import nodemailer, { Transporter } from 'nodemailer';
import { IEmailService } from "../../interfaces/service-interfaces/auth/IEmailService";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { AUTH_MESSAGES } from "../../constants/messages";
import { EXPIRY_TIMES } from "../../shared/utils/expiry.util";

export class EmailService implements IEmailService {
  private _transporter: Transporter;

  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    try {
      await this._transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'YOUR ZENCODE VERIFICATION CODE',
        html: `
          <div style="font-family:'JetBrains Mono',Consolas,'Courier New',monospace; padding:20px;">
            <h2>Welcome to zenCode!</h2>
            <p>Your verification code is:</p>
            <h1 style="background:#4F46E5;color:white;padding:15px;text-align:center;border-radius:8px;">${otp}</h1>
            <p>This code will expire in ${EXPIRY_TIMES.OTP.LABEL}.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="margin:20px 0;">
            <p style="color:#666;font-size:12px;">zenCode - Real-time Coding Interview Platform</p>
          </div>`,
      });
    } catch {
      throw new AppError(AUTH_MESSAGES.EMAIL_SEND_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async sendMentorSetupLink(data: {
    email: string;
    inviteLink: string;
    fullName: string;
  }): Promise<void> {
    try {
      await this._transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: data.email,
        subject: 'Activate Your ZenCode Mentor Account',
        html: `
          <div style="font-family:'JetBrains Mono',Consolas,'Courier New',monospace;padding:20px;">
            <h2>Welcome to ZenCode, ${data.fullName}!</h2>
            <p>You've been invited to join as a mentor. Click the link below to set up your account:</p>
            <a href="${data.inviteLink}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#2D5FFF;color:white;text-decoration:none;border-radius:6px;">
              Activate Account
            </a>
            <p>This link expires in ${EXPIRY_TIMES.MENTOR_INVITE.LABEL}.</p>
            <p>If you didn't expect this invitation, please ignore this email.</p>
            <hr style="margin:20px 0;">
            <p style="color:#666;font-size:12px;">zenCode - Real-time Coding Interview Platform</p>
          </div>`,
      });
    } catch {
      throw new AppError(AUTH_MESSAGES.EMAIL_SEND_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async sendPasswordResetLink(email: string, resetLink: string): Promise<void> {
    try {
      await this._transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Reset Your ZenCode Password',
        html: `
          <div style="font-family:'JetBrains Mono',Consolas,'Courier New',monospace;padding:20px;">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to proceed:</p>
            <a href="${resetLink}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#2D5FFF;color:white;text-decoration:none;border-radius:6px;">
              Reset Password
            </a>
            <p>This link expires in ${EXPIRY_TIMES.PASSWORD_RESET.LABEL}.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <hr style="margin:20px 0;">
            <p style="color:#666;font-size:12px;">zenCode - Real-time Coding Interview Platform</p>
          </div>`,
      });
    } catch {
      throw new AppError(AUTH_MESSAGES.EMAIL_SEND_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
