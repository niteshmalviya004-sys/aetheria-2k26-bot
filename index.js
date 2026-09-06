const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const http = require('http');

// Render port setup to prevent port errors
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => res.end('Aetheria 2K26 WhatsApp Bot is Running!')).listen(PORT);

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        auth: state,
        browser: ['Aetheria-Bot', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        // Print QR Code using qrcode-terminal
        if (qr) {
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            console.log('Connection closed. Reconnecting...');
            connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('Aetheria 2K26 WhatsApp Bot Connected Successfully!');
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
