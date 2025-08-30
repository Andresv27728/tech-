let handler = async (m, { conn, isOwner, isAdmin }) => {
    if (!m.text) return;

    const text = m.text.toLowerCase().trim();
    const [command, ...args] = text.split(' ');

    let settings = global.db.data.settings[conn.user.jid];
    if (!settings) settings = global.db.data.settings[conn.user.jid] = {};

    switch (command) {
        case '+priv':
            if (m.isGroup) {
                return m.reply('Este comando solo se puede usar en chats privados.');
            }
            if (!settings.authorized_users) {
                settings.authorized_users = [];
            }
            if (settings.authorized_users.includes(m.sender)) {
                return m.reply('Ya estás autorizado para usar este bot.');
            }
            settings.authorized_users.push(m.sender);
            m.reply('✅ ¡Ahora estás autorizado para usar este bot!');
            break;

        case '-priv':
            if (m.isGroup) {
                return m.reply('Este comando solo se puede usar en chats privados.');
            }
            if (!settings.authorized_users || !settings.authorized_users.includes(m.sender)) {
                return m.reply('No estás en la lista de usuarios autorizados.');
            }
            settings.authorized_users = settings.authorized_users.filter(user => user !== m.sender);
            m.reply('❌ Ya no estás autorizado para usar este bot.');
            break;

        case '+grupo':
            if (!m.isGroup) {
                return m.reply('Este comando solo se puede usar en grupos.');
            }
            if (!isAdmin) {
                return m.reply('Este comando solo puede ser usado por administradores del grupo.');
            }
            let chat = global.db.data.chats[m.chat];
            if (!chat) chat = global.db.data.chats[m.chat] = {};
            chat.group_enabled = true;
            m.reply('✅ El bot ha sido activado en este grupo.');
            break;

        case '-grupo':
            if (!m.isGroup) {
                return m.reply('Este comando solo se puede usar en grupos.');
            }
            if (!isAdmin) {
                return m.reply('Este comando solo puede ser usado por administradores del grupo.');
            }
            let chat2 = global.db.data.chats[m.chat];
            if (!chat2) chat2 = global.db.data.chats[m.chat] = {};
            chat2.group_enabled = false;
            m.reply('❌ El bot ha sido desactivado en este grupo.');
            break;

        case 'privatemode':
            if (!isOwner) {
                // Silently ignore if not owner to prevent spam
                return;
            }
            const arg = args[0];
            if (arg === 'on') {
                settings.private_mode = true;
                m.reply('✅ El modo privado ha sido activado.');
            } else if (arg === 'off') {
                settings.private_mode = false;
                m.reply('❌ El modo privado ha sido desactivado. El bot ahora responderá en todos los chats.');
            } else {
                m.reply(`Uso incorrecto. Ejemplo: privatemode on|off`);
            }
            break;
    }
};

// This property makes the handler run for every message
handler.all = true;

// Set to default export to be compatible with the plugin loader
export default handler;
