import {EMOJI_NAMES, MAIN_MENU_UI_CONTROLS_EVENT, SET_CURRENCY_EVENT} from './constants.js';
import { getEmoji } from './utils.js';
class UIManager {
    constructor() {
        this.bot = null;
        this.userMainMenuUI = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getEmoji(EMOJI_NAMES.CREATE_LINK)} Замовити обмін`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CREATE_EXCHANGE_REQUEST }],
                    [{ text: `${getEmoji(EMOJI_NAMES.MY_LINKS)} Зв'язок з представником`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CHAT }],
                    [{ text: `${getEmoji(EMOJI_NAMES.SETTINGS)} Про бот`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.BOT_INFO }],
                ]
            }
        }
        this.adminMainMenuUI = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getEmoji(EMOJI_NAMES.CHANGE_PRICE)} Виставити курс`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.SET_CURRENCY_VALUE }],
                    [{ text: `${getEmoji(EMOJI_NAMES.DOWN)} Виставити мінімальну суму`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.SET_CURRENCY_MIN_SUM }],
                    [{ text: `${getEmoji(EMOJI_NAMES.RESERVED)} Виставити резерв`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.SET_CURRENCY_RESERVE }],
                    [{ text: `${getEmoji(EMOJI_NAMES.LIST)} Переглянути останні транзакції`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CHAT }],
                    [{ text: `${getEmoji(EMOJI_NAMES.DETAIL)} Переглянути транзакцію`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CHAT }],
                    [{ text: `${getEmoji(EMOJI_NAMES.NOTIFICATION)} Зробити оголошення`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.NOTIFICATION }],
                    [{ text: `${getEmoji(EMOJI_NAMES.SETTINGS)} Про бот`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.BOT_INFO }],
                ]
            }
        }
        this.currencylistUI = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getEmoji(EMOJI_NAMES.MONEY)} USDT: `, callback_data: SET_CURRENCY_EVENT.USDT }],
                    [{ text: `${getEmoji(EMOJI_NAMES.MONEY)} USDS: `, callback_data: SET_CURRENCY_EVENT.USDS }],
                    [{ text: `${getEmoji(EMOJI_NAMES.EUR)} EUR: `, callback_data: SET_CURRENCY_EVENT.EUR }],
                    [{ text: `${getEmoji(EMOJI_NAMES.USD)} USD: `, callback_data: SET_CURRENCY_EVENT.USD }],
                    [{ text: `${getEmoji(EMOJI_NAMES.CARD)} UAH: `, callback_data: SET_CURRENCY_EVENT.UAH }],
                    [{ text: `${getEmoji(EMOJI_NAMES.MONEY)} BTC: `, callback_data: SET_CURRENCY_EVENT.BTC }],
                    [{ text: `${getEmoji(EMOJI_NAMES.MONEY)} ETH: `, callback_data: SET_CURRENCY_EVENT.ETH }],
                ]
            }
        }
    }

    init(bot) {
        this.bot = bot;
    }

    userMainMenu(chatId, data) {
        this.bot.sendMessage(chatId, `Привіт ${data.first_name || data.last_name}  \nГоловне меню:`, this.userMainMenuUI);
    }

    adminMainMenu(chatId, data) {
        this.bot.sendMessage(chatId, `Привіт ${data.first_name || data.last_name}  \nГоловне меню:`, this.adminMainMenuUI);
    }

    botInfo(chatId) {
        this.bot.sendMessage(chatId, `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi a lectus consequat, commodo urna ut, tempor velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis augue elit`);
    }
    
    currencylist(chatId) {
        this.bot.sendMessage(chatId, `USDT: 3213123 \nBTC: 213 \nETH: 21315 \n`);
    }

    setCurrencyValueUI(chatId) {
        this.bot.sendMessage(chatId, `Оберіть валюту`, this.currencylistUI);
    }

    setCurrencyMinSumUI(chatId) {
        this.bot.sendMessage(chatId, `Оберіть валюту`, this.currencylistUI);
    }

    setCurrencyReserveUI(chatId) {
        this.bot.sendMessage(chatId, `Оберіть валюту`, this.currencylistUI);
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

    notifyMessageAwait(chatId) {
        this.bot.sendMessage(chatId, `Зробіть оголошення`);
    }
}

export default new UIManager()