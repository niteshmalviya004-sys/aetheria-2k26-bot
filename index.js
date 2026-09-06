const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const http = require('http');

// Render Port Binding
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => res.end('Aetheria 2K26 WhatsApp Bot is Active!')).listen(PORT);

// ⚠️ Apna WhatsApp number bina '+' ke enter karein (e.g., '919876543210')
const PHONE_NUMBER = '919203773389'; 

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    // Request Pairing Code if not registered
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(PHONE_NUMBER);
                console.log('\n======================================');
                console.log(`PAIRING CODE: ${code}`);
                console.log('======================================\n');
            } catch (err) {
                console.error("Failed to request pairing code:", err);
            }
        }, 4000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
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
