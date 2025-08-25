import fs from 'fs'
const file = './json/deleted.json'

// Aseguramos archivo
if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}), 'utf-8')

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(file))
  } catch {
    return {}
  }
}

function saveDB(db) {
  fs.writeFileSync(file, JSON.stringify(db, null, 2))
}

let handler = async (m, { conn }) => {}

// Guardar mensajes
handler.before = async (m) => {
  if (!m.message) return
  let db = loadDB()
  db[m.key.id] = {
    chat: m.chat,
    sender: m.sender,
    message: m.message,
    timestamp: Date.now()
  }
  saveDB(db)
}

// Detectar borrados
handler.all = async (m, { conn }) => {
  if (m.message?.protocolMessage?.type === 0) {
    let deletedKey = m.message.protocolMessage.key
    let db = loadDB()
    let saved = db[deletedKey.id]
    if (!saved) return

    let user = saved.sender.split('@')[0]
    let text = `📛 Antidelete 📛\nEl usuario @${user} borró un mensaje:`
    await conn.sendMessage(saved.chat, { text, mentions: [saved.sender] })
    await conn.sendMessage(saved.chat, { forward: saved.message }, { quoted: null })
  }
}

export default handler
