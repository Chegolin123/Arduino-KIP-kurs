// Расположение: C:\OSPanel\domains\Arduino\server\config\mailer.js

const nodemailer = require('nodemailer');

// Создаём тестовый аккаунт Ethereal автоматически при запуске
let transporter = null;

const createTransporter = async () => {
    // Генерируем тестовый аккаунт Ethereal (не требует реальных данных)
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('📧 Тестовый аккаунт Ethereal создан:');
    console.log('   Email:', testAccount.user);
    console.log('   Пароль:', testAccount.pass);
    
    const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'kip-fin@yandex.ru',
        pass: 'пароль_приложения'
    }
});
    
    return transporter;
};

const getTransporter = async () => {
    if (!transporter) {
        await createTransporter();
    }
    return transporter;
};

const sendVerificationEmail = async (email, username, token) => {
    const transport = await getTransporter();
    const verificationUrl = `http://localhost:3000/login?verified=true&token=${token}`;
    
    const mailOptions = {
        from: '"КИП ФИН" <noreply@kip-fin.ru>',
        to: email,
        subject: 'Подтверждение email — КИП ФИН',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background: #1E40AF; padding: 20px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0;">КИП ФИН</h1>
                    <p style="color: #93C5FD; margin: 5px 0 0;">знания для будущего</p>
                </div>
                <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
                    <h2 style="color: #1F2937;">Здравствуйте, ${username}!</h2>
                    <p style="color: #6B7280; line-height: 1.6;">
                        Благодарим за регистрацию на платформе КИП ФИН. 
                        Для подтверждения email перейдите по ссылке:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background: #1E40AF; color: white; padding: 14px 40px; 
                                  text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            Подтвердить email
                        </a>
                    </div>
                    <p style="color: #9CA3AF; font-size: 14px;">
                        Или скопируйте ссылку:<br>
                        <span style="color: #3B82F6;">${verificationUrl}</span>
                    </p>
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                    <p style="color: #9CA3AF; font-size: 12px;">
                        Если вы не регистрировались — проигнорируйте письмо.
                    </p>
                </div>
            </div>
        `
    };

    const info = await transport.sendMail(mailOptions);
    
    // Выводим ссылку для просмотра письма в консоли
    console.log('📧 Письмо отправлено!');
    console.log('🔗 Просмотреть письмо:', nodemailer.getTestMessageUrl(info));
    
    return info;
};

module.exports = { sendVerificationEmail };