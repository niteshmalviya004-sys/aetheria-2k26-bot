const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const http = require('http');

// Render port binding
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => res.end('Aetheria 2K26 WhatsApp Bot is Active!')).listen(PORT);

// ⚠️ Yahan apna WhatsApp Number daalein (Country Code ke sath, bina '+' sign ke)
// Example: '919876543210'
const PHONE_NUMBER = '919203773389'; 

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            const code = await sock.requestPairingCode(PHONE_NUMBER);
            console.log('\n======================================');
            console.log(`YOUR WHATSAPP PAIRING CODE IS: ${code}`);
            console.log('======================================\n');
        }, 3000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
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
