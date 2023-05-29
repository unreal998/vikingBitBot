import { EMOJI_NAMES } from './constants.js'
import fetch from "node-fetch";
/**
 * Returns emoji from emoji name.
 *
 * @param {string} emojiName emoji name (pl, settings).
 * @return {string} emoji
 */
function getEmoji(emojiName) {
    switch(emojiName) {
        case 'pl':
            return '🇵🇱'
        case 'ro':
            return '🇷🇴'
        case 'at':
            return '🇦🇹'
        case EMOJI_NAMES.SETTINGS:
            return '⚙️'
        case EMOJI_NAMES.REMOVE_LINK:
            return '🗑'
        case EMOJI_NAMES.MY_LINKS:
            return '💼'
        case EMOJI_NAMES.CREATE_LINK:
            return '👨‍🔧'
        case EMOJI_NAMES.CHANGE_NAME:
            return '🖌'
        case EMOJI_NAMES.CHANGE_PRICE:
            return '📈'
        case EMOJI_NAMES.BACK_TO_MAIN_MENU:
            return '🔙'
        case EMOJI_NAMES.SEND_MESSAGE:
            return '📩'
        case EMOJI_NAMES.EXCLAMATION :
            return '❗️'
        case EMOJI_NAMES.YES:
            return '✅'
        case EMOJI_NAMES.NO:
            return '❌'
        case EMOJI_NAMES.LINK:
            return '🔗'
        case EMOJI_NAMES.NOTIFICATION:
            return '📢'
        case EMOJI_NAMES.RESERVED:
            return '💰'
        case EMOJI_NAMES.LIST:
            return '📝'
        case EMOJI_NAMES.DETAIL:
            return '🔎'
        case EMOJI_NAMES.DOWN:
            return '🔻'
        case EMOJI_NAMES.USD:
            return '💵'
        case EMOJI_NAMES.EUR:
            return '💶'
        case EMOJI_NAMES.CARD:
            return '💳'
        case EMOJI_NAMES.MONEY:
            return '💸'
        case EMOJI_NAMES.FIND:
            return '🔍'
        case EMOJI_NAMES.OPEN:
            return '📖'
        case EMOJI_NAMES.MANAGER:
            return '🧑‍💻'
        case EMOJI_NAMES.NEW_ADMIN:
            return '👨‍💼'
        default:
            return '❓'
    }
}

/**
 * Returns path to photo from telegram API.
 *
 * @param {string} TOKEN telegram bot API token.
 * @param {string} fileId unquie field ID.
 * @return {string} uri to photo
 */
async function fetchImageFromTelegram(token, fileId) {
    const fileDataUrl = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
    const fileData = await fetch(fileDataUrl)
    .then(response => {
        return response.json()
    })
    .then(data => {
        return data
    })
    return `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`
}

export { getEmoji, fetchImageFromTelegram };