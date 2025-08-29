// Comando +priv
let handlerPriv = async (m, { conn }) => {
    let settings = global.db.data.settings[conn.user.jid]
    if (!settings) settings = global.db.data.settings[conn.user.jid] = {}
    if (!settings.authorized_users) settings.authorized_users = []

    if (settings.authorized_users.includes(m.sender)) {
        return m.reply('Ya estás autorizado para usar este bot.')
    }
    settings.authorized_users.push(m.sender)
    m.reply('✅ ¡Ahora estás autorizado para usar este bot!')
}
handlerPriv.command = ['+priv']
handlerPriv.private = true

// Comando -priv
let handlerUnpriv = async (m, { conn }) => {
    let settings = global.db.data.settings[conn.user.jid]
    if (!settings || !settings.authorized_users || !settings.authorized_users.includes(m.sender)) {
        return m.reply('No estás en la lista de usuarios autorizados.')
    }
    settings.authorized_users = settings.authorized_users.filter(user => user !== m.sender)
    m.reply('❌ Ya no estás autorizado para usar este bot.')
}
handlerUnpriv.command = ['-priv']
handlerUnpriv.private = true

// Comando +grupo
let handlerGrupo = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat) chat = global.db.data.chats[m.chat] = {}
    chat.group_enabled = true
    m.reply('✅ El bot ha sido activado en este grupo.')
}
handlerGrupo.command = ['+grupo']
handlerGrupo.group = true
handlerGrupo.admin = true

// Comando -grupo
let handlerUngrupo = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat) chat = global.db.data.chats[m.chat] = {}
    chat.group_enabled = false
    m.reply('❌ El bot ha sido desactivado en este grupo.')
}
handlerUngrupo.command = ['-grupo']
handlerUngrupo.group = true
handlerUngrupo.admin = true

// Comando privatemode
let handlerPrivateMode = async (m, { conn, text, usedPrefix }) => {
    let settings = global.db.data.settings[conn.user.jid]
    if (!settings) settings = global.db.data.settings[conn.user.jid] = {}

    let arg = text.toLowerCase().trim()
    if (arg === 'on') {
        settings.private_mode = true
        m.reply('✅ El modo privado ha sido activado.')
    } else if (arg === 'off') {
        settings.private_mode = false
        m.reply('❌ El modo privado ha sido desactivado. El bot ahora responderá en todos los chats.')
    } else {
        m.reply(`Uso incorrecto. Ejemplo: ${usedPrefix}privatemode on|off`)
    }
}
handlerPrivateMode.command = ['privatemode']
handlerPrivateMode.owner = true

export {
    handlerPriv as priv,
    handlerUnpriv as unpriv,
    handlerGrupo as grupo,
    handlerUngrupo as ungrupo,
    handlerPrivateMode as privatemode
}
