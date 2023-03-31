import { EMOJI_NAMES, MAIN_MENU_UI_CONTROLS_EVENT } from './constants.js';
import { getEmoji } from './utils.js';
class UIManager {
    constructor() {
        this.bot = null;
        this.mainMenuUIOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getEmoji(EMOJI_NAMES.CREATE_LINK)} Замовити обмін`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CREATE_EXCHANGE_REQUEST }],
                    [{ text: `${getEmoji(EMOJI_NAMES.MY_LINKS)} Зв'язок з представником`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CHAT }],
                    [{ text: `${getEmoji(EMOJI_NAMES.SETTINGS)} Про бот`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.BOT_INFO }],
                ]
            }
        }
    }

    init(bot) {
        this.bot = bot;
    }

    mainMenu(chatId, data) {
        this.bot.sendMessage(chatId, `Привіт ${data.first_name || data.last_name}  \nГоловне меню:`, this.mainMenuUIOptions);
    }

    botInfo(chatId) {
        this.bot.sendMessage(chatId, `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi a lectus consequat, commodo urna ut, tempor velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis augue elit`);
    }
    
    currencylist(chatId) {
        this.bot.sendMessage(chatId, `USDT: 3213123 \nBTC: 213 \nETH: 21315 \n`);
    }

    siteLink(chatId) {
        this.bot.sendMessage(chatId, `Посилання на сайт: 👇 \nhttps:VikingBitExchange.com`);
    }

    chatWithManager(chatId) {
        this.bot.sendMessage(chatId, `Очікуйте відповіді від представика`);
    }

    chatWithManager(chatId) {
        this.bot.sendMessage(chatId, `Очікуйте відповіді від представика`);
    }
}

export default new UIManager()