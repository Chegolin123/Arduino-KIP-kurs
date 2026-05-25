// Расположение: C:\OSPanel\domains\Arduino\server\config\mailer.js
// Реальная отправка писем через Mail.ru

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER || 'kip-kurs@mail.ru',
        pass: process.env.MAIL_PASS || 'LrwjKW1lmk3MQ1PfcBB1'
    }
});

// Проверка подключения при запуске
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Ошибка подключения к почте:', error.message);
    } else {
        console.log('📧 Почтовый сервер готов к отправке писем');
    }
});

const sendVerificationEmail = async (email, username, token) => {
    const verificationUrl = `http://localhost:3000/login?token=${token}`;
    
    const mailOptions = {
        from: '"КИП ФИН" <kip-kurs@mail.ru>',
        to: email,
        subject: 'Подтверждение email — КИП ФИН',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background: #1E40AF; padding: 25px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">КИП ФИН</h1>
                    <p style="color: #93C5FD; margin: 5px 0 0;">знания для будущего</p>
                </div>
                <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
                    <h2 style="color: #1F2937;">Здравствуйте, ${username}!</h2>
                    <p style="color: #6B7280; line-height: 1.6; font-size: 16px;">
                        Благодарим за регистрацию на платформе КИП ФИН. 
                        Для подтверждения email перейдите по ссылке:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background: #1E40AF; color: white; padding: 14px 40px; 
                                  text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;
                                  display: inline-block;">
                            Подтвердить email
                        </a>
                    </div>
                    <p style="color: #9CA3AF; font-size: 14px;">
                        Или скопируйте ссылку:<br>
                        <span style="color: #3B82F6; word-break: break-all;">${verificationUrl}</span>
                    </p>
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 25px 0;">
                    <p style="color: #9CA3AF; font-size: 12px;">
                        Если вы не регистрировались — проигнорируйте письмо.
                    </p>
                </div>
            </div>
        `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Письмо отправлено на:', email);
    
    return info;
};

module.exports = { sendVerificationEmail };