import {EMOJI_NAMES, MAIN_MENU_UI_CONTROLS_EVENT, CURRENCY_EVENT, CURRENCY_NAMES, ORDERS_EVENTS, EMPTY_EVENT, NETWORK_TYPES} from './constants.js';
import { getEmoji } from './utils.js';
class UIManager {
    constructor() {
        this.bot = null;
        this.userMainMenuUI = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getEmoji(EMOJI_NAMES.CREATE_LINK)} Замовити обмін`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CREATE_NEW_ORDER }],
                    [{ text: `${getEmoji(EMOJI_NAMES.FIND)} Перевірити статус ордеру`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.FIND_ORDER }],
                    [{ text: `${getEmoji(EMOJI_NAMES.MY_LINKS)} Зв'язок з представником`, url: "https://t.me/artem_hontar" }],
                    [{ text: `${getEmoji(EMOJI_NAMES.CHANGE_PRICE)} Актуальний курс`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.GET_CURRENCY_VALUES }],
                    [{ text: `${getEmoji(EMOJI_NAMES.SETTINGS)} Про бот`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.BOT_INFO }],
                ]
            }
        }
        this.exchangeNetworksList = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getEmoji(EMOJI_NAMES.LINK)} ${NETWORK_TYPES.BEP_20}`, callback_data: `${ORDERS_EVENTS.SELECT_NETWORK}${NETWORK_TYPES.BEP_20}` }],
                    [{ text: `${getEmoji(EMOJI_NAMES.LINK)} ${NETWORK_TYPES.ERC_20}`, callback_data: `${ORDERS_EVENTS.SELECT_NETWORK}${NETWORK_TYPES.ERC_20}` }],
                    [{ text: `${getEmoji(EMOJI_NAMES.LINK)} ${NETWORK_TYPES.ERC_2}`, callback_data: `${ORDERS_EVENTS.SELECT_NETWORK}${NETWORK_TYPES.ERC_2}` }],
                ]
            }
        }

        this.orderConfirmButtons = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: `${getEmoji(EMOJI_NAMES.YES)} Продовжити`, callback_data: `${ORDERS_EVENTS.PAYMENT_COMPLEATE}` },
                        { text: `${getEmoji(EMOJI_NAMES.NO)} Відхилити`, callback_data: `${ORDERS_EVENTS.CANCEL}` }
                    ],
                ]
            }
        }
        this.adminMainMenuUI = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getEmoji(EMOJI_NAMES.RESERVED)} Cписок валют`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.GET_CURRENCY_LIST }],
                    [{ text: `Конфігурація курсу`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.SET_CURRENCY_VALUES_CONFIG}],
                    [{ text: `${getEmoji(EMOJI_NAMES.OPEN)} Відкриті ордери`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.GET_PENDING_ORDERS_DATA }],
                    [{ text: `${getEmoji(EMOJI_NAMES.LIST)} Переглянути останні транзакції`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.GET_ORDERS_DATA }],
                    [{ text: `${getEmoji(EMOJI_NAMES.FIND)} Перевірити статус ордеру`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.FIND_ORDER }],
                    [{ text: `${getEmoji(EMOJI_NAMES.CARD)} Рахунки`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.WALLETS }],
                    [{ text: `${getEmoji(EMOJI_NAMES.MANAGER)} Змінити контактну особу`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.CHANGE_CONTACT_MANAGER }],
                    [{ text: `${getEmoji(EMOJI_NAMES.NEW_ADMIN)} Додати адміна`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.ADD_NEW_ADMIN }],
                    [{ text: `${getEmoji(EMOJI_NAMES.NOTIFICATION)} Зробити оголошення`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.NOTIFICATION }],
                    [{ text: `${getEmoji(EMOJI_NAMES.SETTINGS)} Про бот`, callback_data: MAIN_MENU_UI_CONTROLS_EVENT.BOT_INFO }],
                ]
            }
        }
    }

    currencyConfigButtonsUI(currencyList) {
        const markupArray = [];
        for (const key in currencyList) {
            const currencys = currencyList[key];
            if (key === 'EUR') {
                markupArray.push(
                    [{ text: `Конфігурація EUR пар`, callback_data: `${EMPTY_EVENT}`}]
                )
                for (const elKey in currencys) {
                    const el = currencys[elKey];
                    markupArray.push(
                        [
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} BUY: ${el.buy}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_BUY}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`},
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} BUY multiplier: ${el.buyMultiplier}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_BUY}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`}
                        ]
                    )
                    markupArray.push( 
                        [
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} SELL: ${el.sell}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_SELL}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`},
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} SELL multiplier: ${el.sellMultiplier}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_SELL}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`}
                        ]
                    )
                }
            } else if (key === 'USD') {
                markupArray.push(
                    [{ text: `Конфігурація USD пар`, callback_data: `${EMPTY_EVENT}`}]
                )
                for (const elKey in currencys) {
                    const el = currencys[elKey];
                    markupArray.push(
                        [
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} BUY: ${el.buy}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_BUY}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`},
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} BUY multiplier: ${el.buyMultiplier}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_BUY}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`}
                        ]
                    )
                    markupArray.push( 
                        [
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} SELL: ${el.sell}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_SELL}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`},
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} SELL multiplier: ${el.sellMultiplier}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_SELL}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`}
                        ]
                    )
                }
            } else if (key === 'USDT') {
                markupArray.push(
                    [{ text: `Конфігурація USDT пар`, callback_data: `${EMPTY_EVENT}`}]
                )
                for (const elKey in currencys) {
                    const el = currencys[elKey];
                    markupArray.push(
                        [
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} BUY multiplier: ${el.buyMultiplier}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_BUY}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`},
                            { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${elKey} SELL multiplier: ${el.sellMultiplier}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_SELL}${CURRENCY_NAMES[key.toUpperCase()]}-${CURRENCY_NAMES[elKey.toUpperCase()]}`}
                        ]
                    )
                }
            }
        };
        return {
            reply_markup: {
                inline_keyboard: markupArray
            }
        }
    }

    currencylistUIButtons(currencyList) {
        const markupArray = [];
        for (const key in currencyList) {
            const el = currencyList[key];
            markupArray.push( 
                [{ text: `${getEmoji(EMOJI_NAMES.MONEY)} ${key} `, callback_data: `${EMPTY_EVENT}`}]
            )
            markupArray.push(
                [
                    { text: `${getEmoji(EMOJI_NAMES.DOWN)} Мін. сума: ${el.minExchange}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_MIN_SUM}${CURRENCY_NAMES[key.toUpperCase()]}`},
                    { text: `${getEmoji(EMOJI_NAMES.RESERVED)} Резерв ${el.reserve}`, callback_data: `${CURRENCY_EVENT.SET_CURRENCY_RESERVE}${CURRENCY_NAMES[key.toUpperCase()]}`}
                ],
            )
        };
        return {
            reply_markup: {
                inline_keyboard: markupArray
            }
        }
    }

    walletUIButtons(currencyList) {
        const markupArray = [];
        for (const key in currencyList) {
            const el = currencyList[key];
            markupArray.push(
                [
                    { text: `${getEmoji(EMOJI_NAMES.CARD)} ${key}: ${el}`, callback_data: `${MAIN_MENU_UI_CONTROLS_EVENT.CHANGE_WALLET}${key}`},
                ]
            )
        };
        return {
            reply_markup: {
                inline_keyboard: markupArray
            }
        }
    }

    currencySelectorUIButtons(currencyList) {
        const markupArray = [];
        for (const key in currencyList) {
            const el = currencyList[key];
            markupArray.push(
                [
                    { text: `${getEmoji(EMOJI_NAMES.MONEY)} ${key}`, callback_data: `${ORDERS_EVENTS.SET_CURRENCY_FOR_EXCHANGE}${CURRENCY_NAMES[key.toUpperCase()]}`},
                ]
            )
        };
        return {
            reply_markup: {
                inline_keyboard: markupArray
            }
        }
    }

    currencyExchangeSelectorUIButtons(currencyList, selectedCurrency) {
        const markupArray = [];
        for (const key in currencyList) {
            const el = currencyList[key];
            if (selectedCurrency.name !== el.name) {
                markupArray.push(
                    [
                        { text: `${getEmoji(EMOJI_NAMES.MONEY)} 1 ${selectedCurrency.name} => ${(+selectedCurrency.sell / (+el.sell)).toFixed(6)} ${key}`, callback_data: `${ORDERS_EVENTS.SET_CURRENCY_FOR_EXCHANGE}${CURRENCY_NAMES[key.toUpperCase()]}`},
                    ],
                    [
                        { text: `${getEmoji(EMOJI_NAMES.DOWN)} Мін. сума: ${el.minExchange}`, callback_data: EMPTY_EVENT},
                        { text: `${getEmoji(EMOJI_NAMES.RESERVED)} Резерв ${el.reserve}`, callback_data: EMPTY_EVENT}
                    ]
                
                )
            }
        };
        return {
            reply_markup: {
                inline_keyboard: markupArray
            }
        }
    }

    pendingOrderslistUIButtons(ordersList) {
        const markupArray = [];
        ordersList.forEach(element => {
            markupArray.push(
                [
                    { text: `${getEmoji(EMOJI_NAMES.LINK)} ${element.transactionID}: ${element.fromSum.currency} ${element.fromSum.value} ${element.toSum.currency} ${element.toSum.value}`, callback_data: `${ORDERS_EVENTS.ORDER_INFO}${element.transactionID.toString()}`},
                    { text: `${getEmoji(EMOJI_NAMES.YES)} Підтвердити:`, callback_data: `${ORDERS_EVENTS.ORDER_CONFIRM}${element.transactionID.toString()}`},
                    { text: `${getEmoji(EMOJI_NAMES.NO)} Відхилити`, callback_data: `${ORDERS_EVENTS.ORDER_REJECT}${element.transactionID.toString()}`}
                ]
            )
        });
        return {
            reply_markup: {
                inline_keyboard: markupArray
            }
        }
    }

    orderslistUIButtons(ordersList) {
        const markupArray = [];
        ordersList.forEach(element => {
            markupArray.push(
                [
                    { text: `${getEmoji(EMOJI_NAMES.LINK)} ${element.transactionID}: ${element.fromSum?.currency} ${element.fromSum?.value} ${element.toSum?.currency} ${element.toSum?.value}`, callback_data: `${ORDERS_EVENTS.ORDER_INFO}${element.transactionID?.toString()}`},
                ]
            )
        });
        return {
            reply_markup: {
                inline_keyboard: markupArray
            }
        }
    }

    orderDataUIButtons(transactionID) {
        return {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: `${getEmoji(EMOJI_NAMES.YES)} Підтвердити`, callback_data: `${ORDERS_EVENTS.ORDER_CONFIRM}${transactionID.toString()}` },
                        { text: `${getEmoji(EMOJI_NAMES.NO)} Відхилити`, callback_data: `${ORDERS_EVENTS.ORDER_REJECT}${transactionID.toString()}` }
                    ],
                ]
            }
        }
    }

    init(bot) {
        this.bot = bot;
    }

    userMainMenu(chatId, data) {
        this.bot.sendMessage(chatId, `Привіт ${data.firstName || data.lastName}  \nГоловне меню:`, this.userMainMenuUI);
    }

    adminMainMenu(chatId, data) {
        this.bot.sendMessage(chatId, `Привіт ${data.firstName || data.lastName}  \nГоловне меню:`, this.adminMainMenuUI);
    }

    botInfo(chatId) {
        this.bot.sendMessage(chatId, `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi a lectus consequat, commodo urna ut, tempor velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis augue elit`);
    }

    currencylistUI(chatId, currencyList) {
        this.bot.sendMessage(chatId, `Список валют`, this.currencylistUIButtons(currencyList));
    }

    currencyValuelistUI(chatId, currencyList) {
        let currencyString = "";
        for (const currency in currencyList) {
            if (currency !== 'UAH') {
                const el = currencyList[currency];
                currencyString += `${currency}: ${el.buy} UAH / ${el.sell} UAH \n`
            }

        }
        this.bot.sendMessage(chatId, `Курс валют: придбати / продати \n` + currencyString);
    }

    pleaseInputData(chatId) {
        this.bot.sendMessage(chatId, `Введіть значення`);
    }

    siteLink(chatId) {
        this.bot.sendMessage(chatId, `Посилання на сайт: 👇 \nhttps:VikingBitExchange.com`);
    }

    chatWithManager(chatId) {
        this.bot.sendMessage(chatId, `Очікуйте відповіді від представика`);
    }

    pendingOrderslist(chatId, ordersList) {
        this.bot.sendMessage(chatId, `Список відкритих ордерів`, this.pendingOrderslistUIButtons(ordersList));
    }

    ordersList(chatId, ordersList)  {
        this.bot.sendMessage(chatId, `Список ордерів`, this.orderslistUIButtons(ordersList));
    }

    walletSelector(receiveWallet, appConfig) {
        switch(receiveWallet) {
            case 'UAH':
                return appConfig.UAHCard
            case 'EUR':
                return appConfig.EURCard
            case 'USD':
                return appConfig.USDCard
            default:
                return appConfig.cryptoWallet
        }
    }

    paymentInfoUI(chatId, orderData, appConfig) {
        let text = `Після перекау сумми замовлення натисніть "Продовжити"
Реквізити:
Рахунок: ${this.walletSelector(orderData.fromSum.currency, appConfig)}
Сумма переказу: ${orderData.fromSum.value} ${orderData.fromSum.currency}
Ви отримаєте: ${orderData.toSum.value} ${orderData.toSum.currency}`;
        if (orderData.network) { text += `\nМережа: ${orderData.network}` }
        this.bot.sendMessage(chatId, text, this.orderConfirmButtons)
    }

    proofUI(chatId, orderData) {
        let text = 'Надішліть';
        const paymentTypeProof = orderData.selectedCurrencyForExchange[0].type === 'crypto' ? ' хеш транзакції' : ' скріншот переказу';
        text += paymentTypeProof;
        this.bot.sendMessage(chatId, text); 
    }

    orderInfoUI(chatId, data, withButtons = false) {
        let text = `Дані ордеру:
id: ${data.transactionID}
Дата: ${new Date(data.timestamp).toString()}
Статус: ${data.status}
Переказав: ${data.fromSum.value} ${data.fromSum.currency}
Отримає: ${data.toSum.value} ${data.toSum.currency}
Рахунок отримувача: ${data.wallet}`;
        if (data.network) { text += `\nМережа: ${data.network}` }
        if (data.proofHash) { text += `\nХеш: ${data.proofHash}` }
        if (data.imgPath) {text += `\nПосилання на фото: ${data.imgPath}`}
        if (withButtons && data.status === 'pending') {
            this.bot.sendMessage(chatId, text, this.orderDataUIButtons(data.transactionID))
        } else {
            this.bot.sendMessage(chatId, text);
        }
    }

    orderRjected(chatId) {
        this.bot.sendMessage(chatId, `Ордер відхилено`);
    }

    currencyConfig(chatId, currencyList) {
        this.bot.sendMessage(chatId, `Конфігурація валют`, this.currencyConfigButtonsUI(currencyList));
    }

    orderConfirm(chatId) {
        this.bot.sendMessage(chatId, `Ордер підтвердженно`);
    }

    notifyMessageAwait(chatId) {
        this.bot.sendMessage(chatId, `Зробіть оголошення`);
    }

    createNewOrderText(chatId, data) {
        this.bot.sendMessage(chatId, `Оберіть валюту яку бажаєте обміняти`, this.currencySelectorUIButtons(data));
    }

    selectCurrencyForExchangeText(chatId, data, selectedCurrency) {
        this.bot.sendMessage(chatId, `Оберіть валюту яку бажаєте отримати`, this.currencyExchangeSelectorUIButtons(data, selectedCurrency));
    }

    inputCurrencyAmountAwait(chatId) {
        this.bot.sendMessage(chatId, `Введіть сумму яку бажаєте обміняти`); 
    }

    inputCurrencyAmountError(chatId) {
        this.bot.sendMessage(chatId, `Вы ввели не число!`); 
    }

    inputExchangeNetwork(chatId) {
        this.bot.sendMessage(chatId, `Оберіть мережу для переказу`, this.exchangeNetworksList); 
    }

    orderIdAwait(chatId) {
        this.bot.sendMessage(chatId, 'Введіть номер ордера'); 
    }

    inputWaletAwait(chatId, selectedCurrencyType) {
        if (selectedCurrencyType === 'crypto') {
            this.bot.sendMessage(chatId, `Введіть номер гаманця для зарахування`);
        } else {
            this.bot.sendMessage(chatId, `Введіть номер карти для зарахування`);
        }
    }

    orderInfoError(chatId) {
        this.bot.sendMessage(chatId, `Ордера по такому номеру не знайдено`);
    }

    contactManagerLinkAwait(chatId) {
        this.bot.sendMessage(chatId, `Введіть посилання на контакт менеджера`);
    }

    walletsData(chatId, walletsData) {
        this.bot.sendMessage(chatId, `Данні рахунків:`, this.walletUIButtons(walletsData));
    }

    inputWalletAwait(chatId) {
        this.bot.sendMessage(chatId, `Введіть новий рахунок`);
    }

    inputUsernameAwait(chatId) {
        this.bot.sendMessage(chatId, `Введіть телеграм нікнейм користувача`);
    }

}

export default new UIManager()