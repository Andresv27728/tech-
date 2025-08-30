let handler = async (m, { conn, command, text, usedPrefix, isOwner, isAdmin }) => {
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
                return m.reply('Este comando solo puede ser usado por el propietario del bot.');
            }
            const arg = text.toLowerCase().trim();
            if (arg === 'on') {
                settings.private_mode = true;
                m.reply('✅ El modo privado ha sido activado.');
            } else if (arg === 'off') {
                settings.private_mode = false;
                m.reply('❌ El modo privado ha sido desactivado. El bot ahora responderá en todos los chats.');
            } else {
                m.reply(`Uso incorrecto. Ejemplo: ${usedPrefix}privatemode on|off`);
            }
            break;
    }
};

handler.command = ['+priv', '-priv', '+grupo', '-grupo', 'privatemode'];
handler.help = ['+priv', '-priv', '+grupo', '-grupo', 'privatemode'];
handler.tags = ['owner', 'group', 'private']; // Add appropriate tags

export default handler;
