const nodemailer = require('nodemailer');
const { mail } = require('../config');
const path = require('path');
const fs = require('fs');

var transporter = null;
var logoPath = path.join(__dirname, '..', '..', 'logo.png');

function getTransporter() {
  if (transporter) return transporter;
  if (!mail.enabled) return null;
  transporter = nodemailer.createTransport({
    host: mail.host, port: mail.port || 587,
    secure: !!mail.secure,
    auth: { user: mail.user, pass: mail.pass },
    connectionTimeout: 7000,   // 7s pour la connexion TCP
    greetingTimeout: 7000,     // 7s pour le greeting SMTP
    socketTimeout: 12000       // 12s total par opération
  });
  return transporter;
}

async function sendMail(to, subject, html) {
  var t = getTransporter();
  if (!t) return { sent: false, reason: 'Mail non configuré' };
  try {
    var attachments = [];
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo'
      });
    }
    console.log('SMTP connect to', mail.host + ':' + (mail.port || 587) + ' as ' + mail.user);
    await t.sendMail({ from: mail.from || mail.user, to, subject, html, attachments });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}

function emailHeader() {
  return '<div style="text-align:center;margin-bottom:24px"><img src="cid:logo" alt="J-Academy" style="width:48px;height:48px;border-radius:10px"></div>';
}

function emailFooter() {
  return '<hr style="border:none;border-top:1px solid #eee;margin:20px 0"><p style="color:#888;font-size:0.8rem;text-align:center">J-Academy — Apprendre en toute simplicité</p>';
}

function welcomeEmail(name) {
  return {
    subject: 'Bienvenue sur J-Academy !',
    html: '<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:30px;background:#f9f9f9;border-radius:12px">' +
      emailHeader() +
      '<h1 style="font-size:1.3rem;text-align:center;color:#111;margin-bottom:16px">Bienvenue sur J-Academy, ' + name + ' !</h1>' +
      '<p style="color:#555;line-height:1.6;font-size:0.95rem">Votre compte a été créé avec succès. Vous pouvez dès maintenant accéder à tous les cours, vidéos et exercices adaptés à votre niveau.</p>' +
      '<div style="text-align:center;margin:24px 0"><a href="https://jacademy.local/niveau.html" style="display:inline-block;background:#111;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Choisir mon niveau</a></div>' +
      emailFooter() + '</div>'
  };
}

function notificationEmail(title, message) {
  return {
    subject: title,
    html: '<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:30px;background:#f9f9f9;border-radius:12px">' +
      emailHeader() +
      '<h1 style="font-size:1.2rem;color:#111;margin-bottom:12px">' + title + '</h1>' +
      '<p style="color:#555;line-height:1.6;font-size:0.95rem">' + message.replace(/\n/g, '<br>') + '</p>' +
      emailFooter() + '</div>'
  };
}

module.exports = { sendMail, welcomeEmail, notificationEmail };
