import fetch from 'node-fetch'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

const premiumFile = './json/premium.json'

// Crear archivo premium si no existe
if (!fs.existsSync(premiumFile)) {
  fs.writeFileSync(premiumFile, JSON.stringify([]), 'utf-8')
}

// Verificar si el bot actual es premium
function isBotPremium(conn) {
  try {
    const data = JSON.parse(fs.readFileSync(premiumFile))
    const botId = conn?.user?.id?.split(':')[0] // Si es "num:device@s.whatsapp.net" → saca el num
    return data.includes(botId)
  } catch {
    return false
  }
}

// Verificar si el bot es WhatsApp Business (jid con ":")
function isBusiness(conn) {
  return conn?.user?.id?.includes(':')
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) return m.reply(`✳️ *Uso correcto:*\n${usedPrefix + command} <enlace o nombre>`)

  try {
    await m.react('⏳')

    // PREMIUM CHECK
    if (!isBotPremium(conn)) {
      return m.reply('⚠️ *Se necesita que el bot sea premium.*\n> Usa *_.buyprem_* para activarlo.')
    }

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = path.join('./JadiBots', botActual, 'config.json')

    let nombreBot = global.namebot || '⎯⎯⎯⎯⎯⎯ Bot Principal ⎯⎯⎯⎯⎯⎯'
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.name) nombreBot = config.name
      } catch {}
    }

    let url = args[0]
    let videoInfo = null

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      let search = await yts(args.join(' '))
      if (!search.videos || search.videos.length === 0) {
        return conn.sendMessage(m.chat, { text: '⚠️ No se encontraron resultados.' }, { quoted: m })
      }
      videoInfo = search.videos[0]
      url = videoInfo.url
    } else {
      let id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
      let search = await yts({ videoId: id })
      if (search && search.title) videoInfo = search
    }

    if (videoInfo.seconds > 3780) {
      return conn.sendMessage(m.chat, {
        text: '❌ El video supera el límite de duración permitido (63 minutos).'
      }, { quoted: m })
    }

    let apiUrl = ''
    let isAudio = false

    if (command == 'play' || command == 'ytmp3') {
      apiUrl = `https://myapiadonix.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`
      isAudio = true
    } else if (command == 'play2' || command == 'ytmp4') {
      apiUrl = `https://myapiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`
    } else {
      return conn.sendMessage(m.chat, { text: '❌ Comando no reconocido.' }, { quoted: m })
    }

    let res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Error al conectar con la API.')
    let json = await res.json()
    if (!json.success) throw new Error('No se pudo obtener información del video.')

    let { title, thumbnail, quality, download } = json.data
    let duration = videoInfo?.timestamp || 'Desconocida'

    let details = `╭➤ *${title}*
┃
┃ ⏱️ Duración: *${duration}*
┃
┃ 🖥️ Calidad: *${quality}*
┃
┃ ❇️ Formato: *${isAudio ? 'Audio' : 'Video'}*
┃
┃ 📌 Fuente: *YouTube*
╰`.trim()

    // Si es PREMIUM y NO Business → mandamos botones
    if (isBotPremium(conn) && !isBusiness(conn)) {
      await conn.sendMessage(m.chat, {
        text: details,
        contextInfo: {
          externalAdReply: {
            title: nombreBot,
            body: 'Elige una opción:',
            thumbnailUrl: thumbnail,
            sourceUrl: url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        },
        buttons: [
          { buttonId: `${usedPrefix}ytmp3 ${url}`, buttonText: { displayText: '🎧 Audio' }, type: 1 },
          { buttonId: `${usedPrefix}ytmp4 ${url}`, buttonText: { displayText: '🎬 Video' }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m })
      return
    }

    // Si es Business, mandamos directo
    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: { url: download },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: true
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: download },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      }, { quoted: m })
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    await conn.sendMessage(m.chat, { text: '❌ Se produjo un error al procesar la solicitud.' }, { quoted: m })
  }
}

handler.help = ['play', 'ytmp3', 'play2', 'ytmp4']
handler.tags = ['downloader']
handler.command = ['play', 'play2', 'ytmp3', 'ytmp4']

export default handler
