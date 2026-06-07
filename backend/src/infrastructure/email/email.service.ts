import nodemailer, { Transporter } from 'nodemailer';
import { IEmailService } from "../../interfaces/service-interfaces/auth/IEmailService";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { AUTH_MESSAGES } from "../../constants/messages";
import { EXPIRY_TIMES } from "../../shared/utils/expiry.util";
import { BookingConfirmationEmailData, BookingCancelledEmailData } from "../../dtos/notification/booking-email.dto";

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
        subject: 'Activate Your zenCode Mentor Account',
        html: `
          <div style="font-family:'JetBrains Mono',Consolas,'Courier New',monospace;padding:20px;">
            <h2>Welcome to zenCode, ${data.fullName}!</h2>
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
        subject: 'Reset Your zenCode Password',
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

  async sendBookingConfirmation(data: BookingConfirmationEmailData): Promise<void> {
    const startFormatted = data.startTime.toLocaleString('en-US', {
      timeZone: 'UTC',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const endFormatted = data.endTime.toLocaleString('en-US', {
      timeZone: 'UTC',
      hour: '2-digit', minute: '2-digit',
    });

    try {
      await this._transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: data.to,
        subject: '✅ Your zenCode Mentor Session is Confirmed!',
        html: `
          <div style="font-family:'JetBrains Mono',Consolas,'Courier New',monospace;padding:32px;max-width:600px;margin:0 auto;background:#0d0d0d;color:#e5e5e5;border-radius:12px;border:1px solid #1c1c1c;">
            <h2 style="color:#4F46E5;margin-bottom:8px;">Session Confirmed 🎉</h2>
            <p style="color:#999;margin-bottom:24px;">Hi ${data.recipientName}, your mentor session is booked and confirmed.</p>

            <div style="background:#1a1a2e;border:1px solid #2d2d5a;border-radius:8px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Session Details</p>
              <p style="margin:0 0 8px;font-size:14px;"><span style="color:#888;">Mentor:</span> <strong style="color:#fff;">${data.mentorName}</strong></p>
              <p style="margin:0 0 8px;font-size:14px;"><span style="color:#888;">Candidate:</span> <strong style="color:#fff;">${data.candidateName}</strong></p>
              <p style="margin:0 0 8px;font-size:14px;"><span style="color:#888;">Time:</span> <strong style="color:#4F46E5;">${startFormatted} – ${endFormatted}</strong></p>
            </div>

            <p style="color:#999;font-size:13px;margin-bottom:0;">You will receive a session link when your mentor starts the session. Make sure to join on time!</p>
            <hr style="margin:24px 0;border-color:#1c1c1c;">
            <p style="color:#444;font-size:11px;">zenCode - Real-time Coding Interview Platform</p>
          </div>`,
      });
    } catch {
      throw new AppError(AUTH_MESSAGES.EMAIL_SEND_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async sendBookingCancelled(data: BookingCancelledEmailData): Promise<void> {
    const startFormatted = data.startTime.toLocaleString('en-US', {
      timeZone: 'UTC',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    try {
      await this._transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: data.to,
        subject: '❌ zenCode Mentor Session Cancelled',
        html: `
          <div style="font-family:'JetBrains Mono',Consolas,'Courier New',monospace;padding:32px;max-width:600px;margin:0 auto;background:#0d0d0d;color:#e5e5e5;border-radius:12px;border:1px solid #1c1c1c;">
            <h2 style="color:#ef4444;margin-bottom:8px;">Session Cancelled</h2>
            <p style="color:#999;margin-bottom:24px;">Hi ${data.recipientName}, your upcoming session has been cancelled.</p>

            <div style="background:#1a0a0a;border:1px solid #5a2d2d;border-radius:8px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Cancelled Session</p>
              <p style="margin:0 0 8px;font-size:14px;"><span style="color:#888;">Mentor:</span> <strong style="color:#fff;">${data.mentorName}</strong></p>
              <p style="margin:0 0 8px;font-size:14px;"><span style="color:#888;">Candidate:</span> <strong style="color:#fff;">${data.candidateName}</strong></p>
              <p style="margin:0 0 8px;font-size:14px;"><span style="color:#888;">Originally scheduled:</span> <strong style="color:#ef4444;">${startFormatted}</strong></p>
              <p style="margin:0 0 8px;font-size:14px;"><span style="color:#888;">Cancelled by:</span> <strong style="color:#fff;">${data.cancelledByName}</strong></p>
            </div>

            <p style="color:#999;font-size:13px;margin-bottom:0;">You can book a new session anytime from your dashboard.</p>
            <hr style="margin:24px 0;border-color:#1c1c1c;">
            <p style="color:#444;font-size:11px;">zenCode - Real-time Coding Interview Platform</p>
          </div>`,
      });
    } catch {
      throw new AppError(AUTH_MESSAGES.EMAIL_SEND_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
