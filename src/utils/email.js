const nodemailer = require('nodemailer');
const { EMAIL_SENDER_CONFIG } = require('../config');


const sendEmail = async (target, html) => {
    // 创建Nodemailer传输器 SMTP 或者 其他 运输机制
    const transporter = nodemailer.createTransport({
        host: EMAIL_SENDER_CONFIG.host, // 第三方邮箱的主机地址
        secure: true, // true for 465, false for other ports
        auth: {
            user: EMAIL_SENDER_CONFIG.auth.user,
            pass: EMAIL_SENDER_CONFIG.auth.pass,
        },
        tls: { rejectUnauthorized: false },
    });
    const date = new Date()
    const month = date.getMonth() + 1;
    const day = date.getDate()
    // 定义transport对象并发送邮件
    let info = await transporter.sendMail({
        from:  EMAIL_SENDER_CONFIG.auth.user, // 发送方邮箱的账号
        to: target, // 邮箱接受者的账号
        subject: `${month}月${day}日 掘金自动签到成功`, // Subject line
        html: html,
    });
    console.log('发送邮件成功');
};

module.exports = {
    sendEmail
}