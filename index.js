const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            console.log('Connection closed. Reconnecting...');
            connectToWhatsApp();
        } else if(connection === 'open') {
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
