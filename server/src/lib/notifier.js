/**
 * 通知发送模块
 * - 浏览器 Web Push（基于 MCP 文档：web-push setVapidDetails + sendNotification）
 * - 邮件通知（基于 MCP 文档：nodemailer createTransport + sendMail）
 */

const webpush = require('web-push');
const nodemailer = require('nodemailer');

// ===== Web Push 初始化 =====

let pushReady = false;

function initWebPush() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || 'mailto:admin@hot-monitor.local';

  if (!pub || !priv) {
    console.warn('[Push] VAPID keys 未配置，Web Push 不可用。请运行 npm run gen-vapid');
    return;
  }

  // 来自 MCP web-push 文档
  webpush.setVapidDetails(email, pub, priv);
  pushReady = true;
  console.log('[Push] Web Push 初始化成功');
}

/**
 * 向所有已订阅浏览器发送推送通知
 * @param {string} title
 * @param {string} body
 * @param {string} url  - 点击跳转链接
 * @param {object[]} subscriptions - 来自数据库的订阅列表
 */
async function sendWebPush(title, body, url, subscriptions) {
  if (!pushReady || subscriptions.length === 0) return;

  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    subscriptions.map(sub => {
      const subscription = JSON.parse(sub.subscription);
      return webpush.sendNotification(subscription, payload);
    })
  );

  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) {
    console.warn(`[Push] ${failed}/${subscriptions.length} 个推送失败`);
  }
}

// ===== 邮件通知初始化 =====

let mailTransporter = null;

function initMailer() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[Mail] SMTP 未配置，邮件通知不可用');
    return;
  }

  // 来自 MCP nodemailer 文档
  mailTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  console.log('[Mail] 邮件发送器初始化成功');
}

/**
 * 发送邮件通知
 */
async function sendMail(subject, htmlBody) {
  if (!mailTransporter) return;

  const from = process.env.SMTP_USER;
  const to = process.env.NOTIFY_EMAIL || from;

  try {
    await mailTransporter.sendMail({
      from: `"Hot-Monitor" <${from}>`,
      to,
      subject,
      html: htmlBody,
    });
  } catch (err) {
    console.error('[Mail] 发送失败:', err.message);
  }
}

/**
 * 统一发送通知入口
 */
async function notify(title, body, url, subscriptions) {
  await Promise.allSettled([
    sendWebPush(title, body, url, subscriptions),
    sendMail(
      `🔥 Hot-Monitor：${title}`,
      `<h2>${title}</h2><p>${body}</p><p><a href="${url}">查看原文</a></p>`
    ),
  ]);
}

module.exports = { initWebPush, initMailer, notify, sendWebPush, sendMail };
