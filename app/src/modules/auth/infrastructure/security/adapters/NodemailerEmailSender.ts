// Adaptador de Nodemailer para el puerto EmailSender
// Implementación concreta del envío de emails usando Nodemailer

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailSender } from '../../../application/ports/EmailSender.interface';

@Injectable()
export class NodemailerEmailSender implements EmailSender {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar el transportador de Nodemailer
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@sistema.com',
      to: email,
      subject: 'Código de restablecimiento de contraseña - ERP',
      html: this.getEmailTemplate(code),
      text: this.getEmailTextVersion(code),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error('Error al enviar el email de restablecimiento');
    }
  }

  // Template HTML del email
  private getEmailTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .code-box {
            background-color: #007bff;
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            letter-spacing: 8px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Restablecimiento de contraseña</h2>
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Tu código de verificación es:</p>
          <div class="code-box">${code}</div>
          <p><strong>Este código expira en 15 minutos.</strong></p>
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje de forma segura.</p>
          <div class="footer">
            <p>Saludos,<br>Equipo de Sistema</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Versión de texto plano del email (fallback)
  private getEmailTextVersion(code: string): string {
    return `
ERP Sistema - Restablecimiento de contraseña

Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Tu código de verificación es: ${code}

Este código expira en 15 minutos.

Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje de forma segura.

Saludos,
Equipo de Sistema
    `.trim();
  }
}
