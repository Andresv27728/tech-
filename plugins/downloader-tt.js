import fetch from 'node-fetch'

const cooldown = new Map()

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Verificar enlace
  if (!args[0]) return m.reply(
    `📥 Uso correcto:
${usedPrefix + command} <enlace válido de TikTok>

Ejemplo:
${usedPrefix + command} https://www.tiktok.com/@usuario/video/123456789`
  )

  // --- Límite de 10 usos cada 5 horas ---
  const user = m.sender
  const now = Date.now()
  const limit = 10
  const timeLimit = 5 * 60 * 60 * 1000 // 5 horas en ms

  if (!cooldown.has(user)) {
    cooldown.set(user, { count: 0, lastReset: now })
  }

  let userData = cooldown.get(user)

  if (now - userData.lastReset > timeLimit) {
    // Reset después de 5h
    userData.count = 0
    userData.lastReset = now
  }

  if (userData.count >= limit) {
    let restante = timeLimit - (now - userData.lastReset)
    let horas = Math.floor(restante / (1000 * 60 * 60))
    let minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60))

    return m.reply(
      `⏳ Has alcanzado el límite de *${limit} descargas* en ${command.toUpperCase()}.\n` +
      `Vuelve a intentarlo en *${horas}h ${minutos}m*.`
    )
  }

  userData.count++
  cooldown.set(user, userData)

  // --- Lógica principal ---
  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    let apiURL = `https://myapiadonix.vercel.app/api/tiktok?url=${encodeURIComponent(args[0])}`
    let response = await fetch(apiURL)
    let data = await response.json()

    if (data.status !== 200 || !data.result?.video)
      throw new Error('No se pudo obtener el video')

    let info = data.result

    let caption = `
📌 Título: *${info.title}*
👤 Autor: *@${info.author.username || 'Desconocido'}*
⏱️ Duración: *${info.duration || 'N/D'} segundos*

📊 Estadísticas
♥ Likes: *${info.likes?.toLocaleString() || 0}*
💬 Comentarios: *${info.comments?.toLocaleString() || 0}*
🔁 Compartidos: *${info.shares?.toLocaleString() || 0}*
👁️ Vistas: *${info.views?.toLocaleString() || 0}*`.trim()

    await conn.sendMessage(m.chat, {
      video: { url: info.video },
      caption,
      fileName: `${info.title}.mp4`,
      mimetype: 'video/mp4',
      contextInfo: {
        externalAdReply: {
          title: info.title,
          body: `Autor: ${info.author.name || 'Desconocido'}`,
          thumbnailUrl: info.thumbnail,
          sourceUrl: args[0],
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('❌ No se pudo procesar el video. Intenta nuevamente más tarde.')
  }
}

handler.command = ['tiktok', 'tt']
handler.help = ['tiktok']
handler.tags = ['downloader']

export default handler
