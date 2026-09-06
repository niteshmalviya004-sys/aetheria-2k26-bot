const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const http = require('http');
const QRCode = require('qrcode');

let qrImageHtml = '<h2>QR Code Generating... Refresh page in 5 seconds.</h2>';

// Express-less Lightweight HTTP Server
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Aetheria Bot QR</title>
            <meta http-equiv="refresh" content="10">
            <style>
                body { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#111; color:#fff; }
                img { border: 8px solid white; border-radius: 8px; }
            </style>
        </head>
        <body>
            <h1>Aetheria 2K26 WhatsApp Bot</h1>
            ${qrImageHtml}
            <p>Scan this QR code using WhatsApp Link Device</p>
        </body>
        </html>
    `);
}).listen(PORT, () => console.log(`Web Server active on port ${PORT}`));

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop')
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            try {
                const url = await QRCode.toDataURL(qr);
                qrImageHtml = `<img src="${url}" width="300"/>`;
                console.log('✅ Fresh QR Code generated on Web Link!');
            } catch (err) {
                console.error('Failed to render QR', err);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            qrImageHtml = '<h2>✅ Bot Successfully Connected To WhatsApp!</h2>';
            console.log('✅ Aetheria 2K26 WhatsApp Bot Connected Successfully!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            for (const msg of messages) {
                if (!msg.key.fromMe && msg.message?.conversation) {
                    const text = msg.message.conversation.toLowerCase();
                    if (text === 'ping' || text === 'aetheria') {
                        await sock.sendMessage(msg.key.remoteJid, { text: 'Welcome to Aetheria 2K26!' });
                    }
                }
            }
        }
    });
}

connectToWhatsApp();
