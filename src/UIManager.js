import {EMOJI_NAMES, MAIN_MENU_UI_CONTROLS_EVENT, CURRENCY_EVENT, CURRENCY_NAMES} from './constants.js';
import { getEmoji } from './utils.js';
class UIManager {
    constructor() {
        this.bot = null;
        this.userMainMenuUI = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getEmoji(EMOJI_NAMES.CREATE_LINK)} Замовити обмін`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CREATE_EXCHANGE_REQUEST }],
                    [{ text: `${getEmoji(EMOJI_NAMES.MY_LINKS)} Зв'язок з представником`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CHAT }],
                    [{ text: `${getEmoji(EMOJI_NAMES.MY_LINKS)} Актуальний курс`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.GET_CURRENCY_VALUES }],
                    [{ text: `${getEmoji(EMOJI_NAMES.SETTINGS)} Про бот`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.BOT_INFO }],
                ]
            }
        }
        this.adminMainMenuUI = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getEmoji(EMOJI_NAMES.RESERVED)} Cписок валют`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.GET_CURRENCY_LIST }],
                    [{ text: `${getEmoji(EMOJI_NAMES.LIST)} Переглянути останні транзакції`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CHAT }],
                    [{ text: `${getEmoji(EMOJI_NAMES.DETAIL)} Переглянути транзакцію`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CHAT }],
                    [{ text: `${getEmoji(EMOJI_NAMES.NOTIFICATION)} Зробити оголошення`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.NOTIFICATION }],
                    [{ text: `${getEmoji(EMOJI_NAMES.SETTINGS)} Про бот`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.BOT_INFO }],
                ]
            }
        }
    }

    currencylistUIButtons(currencyList) {
        const markupArray = [];
        for (const key in currencyList) {
            const el = currencyList[key];
            markupArray.push(
                [
                    { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${key}: ${el.value}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_VALUE}${CURRENCY_NAMES[key.toUpperCase()]}`},
                    { text: `${getEmoji(EMOJI_NAMES.DOWN)} Мін. сума: ${el.minExchange}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_MIN_SUM}${CURRENCY_NAMES[key.toUpperCase()]}`},
                    { text: `${getEmoji(EMOJI_NAMES.RESERVED)} Резерв ${el.reserve}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_RESERVE}${CURRENCY_NAMES[key.toUpperCase()]}`}
                ]
            )
        };
        return {
            reply_markup: {
                inline_keyboard: markupArray
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

    currencylistUI(chatId, currencyList) {
        this.bot.sendMessage(chatId, `Список валют`, this.currencylistUIButtons(currencyList));
    }

    pleaseInputData(chatId) {
        this.bot.sendMessage(chatId, `Введіть значення`);
    }

    

    // setCurrencyValueUI(chatId) {
    //     this.bot.sendMessage(chatId, `Оберіть валюту`, this.currencylistUI);
    // }

    // setCurrencyMinSumUI(chatId) {
    //     this.bot.sendMessage(chatId, `Оберіть валюту`, this.currencylistUI);
    // }

    // setCurrencyReserveUI(chatId) {
    //     this.bot.sendMessage(chatId, `Оберіть валюту`, this.currencylistUI);
    // }

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