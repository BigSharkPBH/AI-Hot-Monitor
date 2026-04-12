/**
 * 生成 VAPID 密钥对，输出到控制台
 * 运行一次：node scripts/gen-vapid.js
 * 将生成的 key 填入 .env 文件的 VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
 */
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('=== VAPID Keys Generated ===');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('');
console.log('请将以上两行复制到 server/.env 文件中');
