import nodemailer from 'nodemailer';

// Create a test account for development (you can replace with real SMTP in production)
const createTestAccount = async () => {
  if (process.env.NODE_ENV === 'development') {
    return await nodemailer.createTestAccount();
  }
  return null;
};

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  try {
    const testAccount = await createTestAccount();
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || testAccount?.user,
        pass: process.env.SMTP_PASS || testAccount?.pass,
      },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Palahian" <noreply@palahian.com>',
      to: email,
      subject: 'Verify your email address - Palahian',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Palahian, ${name}!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 