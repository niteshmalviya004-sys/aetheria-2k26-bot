const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const http = require('http');
const QRCode = require('qrcode');

let currentQr = '';

const PORT = process.env.PORT || 10000;
http.createServer(async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    let bodyContent = '<h2>QR Code Generating... Refresh in 5 seconds.</h2>';
    if (currentQr) {
        try {
            const svg = await QRCode.toString(currentQr, { type: 'svg', margin: 2 });
            bodyContent = `<div style="background:white; padding:20px; border-radius:10px;">${svg}</div>`;
        } catch (e) {
            bodyContent = '<h3>Error rendering QR Code</h3>';
        }
    }

    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Aetheria Bot QR</title>
            <meta http-equiv="refresh" content="7">
            <style>
                body { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; background:#111; color:#fff; margin:0; }
                svg { width: 280px; height: 280px; }
            </style>
        </head>
        <body>
            <h1>Aetheria 2K26 WhatsApp Bot</h1>
            ${bodyContent}
            <p>Scan this QR code using WhatsApp Linked Devices</p>
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
            currentQr = qr;
            console.log('✅ New SVG QR Code Ready!');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            currentQr = '';
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
