import { EMOJI_NAMES } from './constants.js'
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
            return '✍️'
        default:
            return '❓'
    }
}

export { getEmoji };