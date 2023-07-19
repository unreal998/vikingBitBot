import BotAPI from 'node-telegram-bot-api';
import fetch from "node-fetch";
import {
    MAIN_MENU_UI_CONTROLS_EVENT,
    SERVER_URL,
    TOKEN,
    CURRENCY_EVENT,
    ORDERS_EVENTS, EMOJI_NAMES, EMPTY_EVENT
} from './src/constants.js';
import UIManager from './src/UIManager.js';
import {io} from "socket.io-client";
import {fetchImageFromTelegram, getEmoji} from "./src/utils.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
class BotController {
    constructor(token) {
        this.bot = new BotAPI(token, { polling: true });
        this.commandList = [
            { command: '/start', description: 'start bot' }
        ];
        this.notificationMessageAwait = false;
        this.inputEventAwait = '';
        this.onMessageHandler = this.onMessageHandler.bind(this);
        this.appConfig = {
            cryptoWallet: '',
            UAHCard: '',
            USDCard: '',
            EURCard: ''
        }
        this.orderData = {
            selectedCurrencyForExchange: [],
            wallet: '',
            network: '',
            transactionID: '',
            status: '',
            network: '',
            timestamp: '',
            coupon: '',
            login: ''
        }

    }

    init() {
        this.bot.setMyCommands(this.commandList)
        this.addEventListeners()
        UIManager.init(this.bot)
    }

    startWork(msg) {
        this.clean();
        this.addEventListeners();
        const chatData = msg.chat;
        const chatId = chatData.id;
        // this.socket = io(SERVER_URL);
        this.backToMainMenu(msg, chatId);
        //         this.socket.emit('new-user', {chatId: chatId.toString()});
    }

    backToMainMenu(msg, chatId) {
        this.authUser(msg).then(data => {
            if (data) {
                if (data.type === 'admin') {
                    UIManager.adminMainMenu(chatId, data);
                }
                else {
                    UIManager.userMainMenu(chatId, data)
                }
            } else {
                this.addNewUser(msg).then(data => {
                    UIManager.userMainMenu(data.id, data)
                })
            }
        });
    }

    async authUser(msg) {
        this.userData = await fetch(SERVER_URL + '/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(msg.chat)
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            console.log(data)
            return data
        })
        return this.userData;
    }

    async addNewUser(msg) {
        const userData = await fetch(SERVER_URL + '/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(msg.chat)
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            return data
        })
        return userData;
    }

    async addNewAdmin(userName) {
        const userData = await fetch(SERVER_URL + '/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userName})
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            return data
        })
        return userData;
    }

    async createNewOrder(userData) {
        this.orderData.status = 'pending';
        this.orderData.timestamp = Date.now();
        this.orderData.transactionID = Math.floor(Math.random() * 100000) + 1;
        this.orderData.login = userData.username;
        delete this.orderData.selectedCurrencyForExchange;
        await fetch(SERVER_URL + '/orders', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.orderData)
        })
        .then(response => {
            UIManager.orderInfoUI(userData.id, this.orderData)
        })
    }


    addEventListeners() {
        this.bot.on('message', this.onMessageHandler);

        this.bot.on('callback_query', query => {
            const chatId = query.message.chat.id;
            if (typeof (query.data) === "string") {
                let dataParam = null;
                if (query.data.includes(CURRENCY_EVENT.SET_CURRENCY_BUY)) {
                    let separateChatId = [...query.data.matchAll(/(SET_CURRENCY_BUY)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                } else if (query.data.includes(CURRENCY_EVENT.SET_CURRENCY_SELL)) {
                    let separateChatId = [...query.data.matchAll(/(SET_CURRENCY_SELL)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                } else if (query.data.includes(CURRENCY_EVENT.SET_CURRENCY_RESERVE)) {
                    let separateChatId = [...query.data.matchAll(/(SET_CURRENCY_RESERVE)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                } else if (query.data.includes(CURRENCY_EVENT.SET_CURRENCY_MIN_SUM)) {
                    let separateChatId = [...query.data.matchAll(/(SET_CURRENCY_MIN_SUM)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                } else if (query.data.includes(ORDERS_EVENTS.ORDER_CONFIRM)) {
                    let separateChatId = [...query.data.matchAll(/(ORDER_CONFIRM)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                } else if (query.data.includes(ORDERS_EVENTS.ORDER_INFO)) {
                    let separateChatId = [...query.data.matchAll(/(ORDER_INFO)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                } else if (query.data.includes(ORDERS_EVENTS.ORDER_REJECT)) {
                    let separateChatId = [...query.data.matchAll(/(ORDER_REJECT)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                } else if (query.data.includes(ORDERS_EVENTS.SET_CURRENCY_FOR_EXCHANGE)) {
                    let separateChatId = [...query.data.matchAll(/(SET_CURRENCY_FOR_EXCHANGE)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                } else if (query.data.includes(ORDERS_EVENTS.SELECT_NETWORK)) {
                    let separateChatId = [...query.data.matchAll(/(SELECT_NETWORK)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2]; 
                } else if (query.data.includes(MAIN_MENU_UI_CONTROLS_EVENT.CHANGE_WALLET)) {
                    let separateChatId = [...query.data.matchAll(/(CHANGE_WALLET)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2]; 
                } else if (query.data.includes(CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_SELL)) {
                    let separateChatId = [...query.data.matchAll(/(SET_CURRENCY_MULTIPLIER_SELL)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2]; 
                } else if (query.data.includes(CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_BUY)) {
                    let separateChatId = [...query.data.matchAll(/(SET_CURRENCY_MULTIPLIER_BUY)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2]; 
                }
                
                switch (query.data) {   
                    case MAIN_MENU_UI_CONTROLS_EVENT.NOTIFICATION:
                        this.notificationMessageAwait = true;
                        UIManager.notifyMessageAwait(chatId);
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.FIND_ORDER:
                        this.inputEventAwait = {
                            event: query.data,
                            data: null
                        };
                        UIManager.orderIdAwait(chatId)
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.SET_CURRENCY_VALUES_CONFIG:
                        this.getExchangeConfig().then(data => {
                            UIManager.currencyConfig(chatId, data)
                        })
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.CREATE_NEW_ORDER:
                        this.getCurrencyList(chatId).then(data => {
                            UIManager.createNewOrderText(chatId, data)
                        });
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.CHANGE_CONTACT_MANAGER:
                        this.inputEventAwait = {
                            event: query.data,
                            data: null
                        };
                        UIManager.contactManagerLinkAwait(chatId)
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.WALLETS:
                        this.getAppConfig().then(data => {
                            UIManager.walletsData(chatId, {EURCard: data.EURCard, UAHCard: data.UAHCard, USDCard: data.USDCard, cryptoWallet: data.cryptoWallet})
                        })
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.GET_CURRENCY_LIST:
                        this.getCurrencyList(chatId).then(data => {
                            UIManager.currencylistUI(chatId, data);
                        });
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.GET_CURRENCY_VALUES:
                        this.getCurrencyList(chatId).then(data => {
                            UIManager.currencyValuelistUI(chatId, data)
                        });
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.BOT_INFO:
                        UIManager.botInfo(chatId);
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.GET_PENDING_ORDERS_DATA:
                        this.getPendingOrders(chatId).then(data => {
                            UIManager.pendingOrderslist(chatId, data);
                        });
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.GET_ORDERS_DATA:
                        this.getOrdersData(chatId).then(data => {
                            const arrayOrders = []
                            for (const key in data) {
                                arrayOrders.push(data[key])
                            }
                            UIManager.ordersList(chatId, arrayOrders);
                        });
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.CHANGE_WALLET:
                        this.inputEventAwait = {
                            event:query.data,
                            data: dataParam
                        };
                        UIManager.inputWalletAwait(chatId);
                        break;
                    case ORDERS_EVENTS.SELECT_NETWORK:
                        this.orderData.network = dataParam;
                        this.inputEventAwait = {
                            event:ORDERS_EVENTS.ORDER_INPUT_WALLET_AWAIT,
                            data: null
                        };
                        UIManager.inputWaletAwait(chatId, this.orderData.selectedCurrencyForExchange[1].type)
                        break;
                    case ORDERS_EVENTS.PAYMENT_COMPLEATE:
                        this.inputEventAwait = {
                            event: ORDERS_EVENTS.PAYMENT_COMPLEATE,
                            data: null
                        };
                        UIManager.proofUI(chatId, this.orderData);
                        break;
                    case ORDERS_EVENTS.CANCEL:
                        this.backToMainMenu(query.message, chatId);
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.ADD_NEW_ADMIN:
                        this.inputEventAwait = {
                            event:query.data,
                            data: null
                        };
                        UIManager.inputUsernameAwait(chatId);
                        break;
                    case ORDERS_EVENTS.SET_CURRENCY_FOR_EXCHANGE: 
                        if (this.orderData.selectedCurrencyForExchange.length < 1) {
                            this.getCurrencyList(chatId).then(data => {
                                const selectedCurrency = data[dataParam];
                                this.orderData.selectedCurrencyForExchange.push(selectedCurrency);
                                UIManager.selectCurrencyForExchangeText(chatId, data, selectedCurrency)
                            });
                        }
                        else {
                            this.getCurrencyList(chatId).then(data => {
                                const selectedCurrency = data[dataParam];
                                this.orderData.selectedCurrencyForExchange.push(selectedCurrency);
                                this.inputEventAwait = {
                                    event:ORDERS_EVENTS.ORDER_INPUT_AMOUNT_AWAIT,
                                    data: null
                                };
                                UIManager.inputCurrencyAmountAwait(chatId);
                            })
                        }
                        break;
                    case CURRENCY_EVENT[query.data]:
                        this.inputEventAwait = {
                            event:CURRENCY_EVENT[query.data],
                            data: dataParam
                        }
                        UIManager.pleaseInputData(chatId)
                        break;
                    case ORDERS_EVENTS.ORDER_CONFIRM:
                        this.updateOrderStatus(dataParam, 'confirm').then(() => {
                            UIManager.orderConfirm(chatId);
                            this.getPendingOrders(chatId).then(data => {
                                UIManager.pendingOrderslist(chatId, data);
                            });
                        });
                        break;
                    case ORDERS_EVENTS.ORDER_INFO:
                        this.getOrderData(dataParam).then((data) => {
                            UIManager.orderInfoUI(chatId, data, true);
                        });
                        break;
                    case ORDERS_EVENTS.ORDER_REJECT:
                        this.updateOrderStatus(dataParam, 'reject').then(() => {
                            UIManager.orderRjected(chatId);
                            this.getPendingOrders(chatId).then(data => {
                                UIManager.pendingOrderslist(chatId, data);
                            });
                        });
                        break;
                    case EMPTY_EVENT:
                        break;
                    default:
                        this.bot.sendMessage(chatId, "Выберите корректную кнопку");
                        break;
                }
            }
        })
    }

    async getAppConfig() {
        const appConfig = await fetch(`${SERVER_URL}/appConfig`)
        .then(response => {
            return response.json();
        })
        .then(jsonData => {
            return jsonData;
        })
        return appConfig;
    }   

    async updateAppConfig(data) {
        const appConfig = await fetch(SERVER_URL + '/appConfig', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            return data
        })
        return appConfig;
    }

    onMessageHandler(msg) {
        const chatId = msg.chat.id;
        const text = msg.text;
        const photo = msg.photo;
        if (text === "/start") {
            return this.startWork(msg);
        }
        if (this.inputEventAwait) {
            switch (this.inputEventAwait.event) {
                case CURRENCY_EVENT.SET_CURRENCY_BUY:
                    this.setCurrencyBuy(chatId, text, this.inputEventAwait)
                    break;
                case CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_SELL:
                    this.setCurrencyMultiplierSell(chatId, text, this.inputEventAwait)
                    break;
                case CURRENCY_EVENT.SET_CURRENCY_MULTIPLIER_BUY:
                    this.setCurrencyMultiplierBuy(chatId, text, this.inputEventAwait)
                    break;
                case CURRENCY_EVENT.SET_CURRENCY_SELL:
                    this.setCurrencySell(chatId, text, this.inputEventAwait)
                    break;
                case CURRENCY_EVENT.SET_CURRENCY_RESERVE:
                    this.setCurrencyReserves(chatId, text, this.inputEventAwait)
                    break;
                case CURRENCY_EVENT.SET_CURRENCY_MIN_SUM:
                    this.setCurrencyMinSum(chatId, text, this.inputEventAwait)
                    break;
                case ORDERS_EVENTS.PAYMENT_COMPLEATE:
                    if (photo) {
                        fetchImageFromTelegram(TOKEN, photo[2].file_id).then(data => {
                            this.orderData.imgPath = data;
                            this.createNewOrder(msg.chat);
                        })
                    } else {
                        this.orderData.proofHash = text
                        this.createNewOrder(msg.chat);
                    }
                    break;
                case ORDERS_EVENTS.ORDER_INPUT_WALLET_AWAIT:
                    this.orderData.wallet = text;
                    this.getAppConfig().then(data => {
                        UIManager.paymentInfoUI(chatId, this.orderData, data)
                    })
                    break;
                case MAIN_MENU_UI_CONTROLS_EVENT.FIND_ORDER:
                    this.getOrderData(text)
                    .then((data) => {
                        UIManager.orderInfoUI(chatId, data)
                    })
                    .catch((err) => {
                        UIManager.orderInfoError(chatId)
                    })
                    break;
                case MAIN_MENU_UI_CONTROLS_EVENT.CHANGE_CONTACT_MANAGER:
                    this.getAppConfig().then(data => {
                        const newAppconfigData = {...data, conactManager: text}
                        this.updateAppConfig(newAppconfigData).then(data => {
                            this.bot.sendMessage(chatId, JSON.stringify(data))
                        })
                    })
                    break;
                case MAIN_MENU_UI_CONTROLS_EVENT.CHANGE_WALLET:
                    this.getAppConfig().then(data => {
                        const newAppconfigData = {...data};
                        newAppconfigData[this.inputEventAwait.data] = text;
                        this.updateAppConfig(newAppconfigData).then(data => {
                            this.bot.sendMessage(chatId, JSON.stringify(data))
                        })
                    })
                    break;
                case MAIN_MENU_UI_CONTROLS_EVENT.ADD_NEW_ADMIN:
                    this.addNewAdmin(text).then(data => {
                        this.bot.sendMessage(chatId, JSON.stringify(data))
                    })
                    break;
                case ORDERS_EVENTS.ORDER_INPUT_AMOUNT_AWAIT:
                    if (!Number.isNaN((+text))) {
                        this.orderData.fromSum = {
                            currency: this.orderData.selectedCurrencyForExchange[0].name,
                            value: ((+this.orderData.selectedCurrencyForExchange[0].sell / (+this.orderData.selectedCurrencyForExchange[1].sell)*(+text))).toFixed(6)
                        };
                         this.orderData.toSum = {
                            currency: this.orderData.selectedCurrencyForExchange[1].name,
                            value: text
                        }
                        if (this.orderData.selectedCurrencyForExchange[1].type === "crypto") {
                            UIManager.inputExchangeNetwork(chatId);
                        } else {
                            this.inputEventAwait = {
                                event:ORDERS_EVENTS.ORDER_INPUT_WALLET_AWAIT,
                                data: null
                            };
                            UIManager.inputWaletAwait(chatId, this.orderData.selectedCurrencyForExchange[1].type)
                        }
                    } else {
                        UIManager.inputCurrencyAmountError(chatId).then(()=> {
                            this.inputEventAwait = {
                                event:ORDERS_EVENTS.ORDER_INPUT_AMOUNT_AWAIT,
                                data: null
                            };
                            UIManager.inputCurrencyAmountAwait(chatId);
                        })
                    }
                    break;
                default:
                    console.log('WRONG inputEventAwait PARAMS:', this.inputEventAwait)
            }

        }
        if (this.notificationMessageAwait) {
            this.notificationMessageAwait = false;
            this.notifyUsers(text);
            return true;
        }
    }

    async getPendingOrders(chatId) {
        const pendingOrdersList = await this.getOrdersData().then(data => {
            const pendingOrdersArray = [];
            for (const key in data) {
                if (data[key].status === 'pending') {
                    const element = data[key];   
                    pendingOrdersArray.push(element);
                }
            }
            return pendingOrdersArray;
        })
        return pendingOrdersList;

    }

    async getOrdersData() {
        const ordersList = await fetch(`${SERVER_URL}/orders`)
        .then(response => {
            return response.json();
        })
        .then(jsonData => {
            return jsonData;
        })
        return ordersList;
    }

    async getOrderData(transactionID) {
        const orderData = await fetch(`${SERVER_URL}/orders?id=${transactionID}`)
        .then(response => {
            return response.json();
        })
        .then(jsonData => {
            return jsonData;
        })
        console.log(orderData)
        return orderData;
    }

    async updateOrderStatus(transactionID, status) {
        await fetch(`${SERVER_URL}/orders`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({transactionID, status})
        })
        .catch(err => {
            console.log(err);
        })
    }

    async getCurrencyList(chatId) {
        const currencyList = await fetch(`${SERVER_URL}/currencyList`)
        .then(response => {
            return response.json();
        })
        .then(jsonData => {
            return jsonData;
        })
        return currencyList
    }

    async getExchangeConfig() {
        const currencyList = await fetch(`${SERVER_URL}/exchangeConfig`)
        .then(response => {
            return response.json();
        })
        .then(jsonData => {
            return jsonData;
        })
        return currencyList
    }

    async setCurrencyBuy(chatId, value, eventData) {
        const currencyResponce = await fetch(`${SERVER_URL}/currencyBuy`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currenyName: eventData.data, value})
        }).then(response => {
            return response.json();
        }).then(responseData => {
            return responseData;
        })
        this.inputEventAwait = null;
        this.bot.sendMessage(chatId, JSON.stringify(currencyResponce))
    }

    async setCurrencySell(chatId, value, eventData) {
        const currencyResponce = await fetch(`${SERVER_URL}/currencySell`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currenyName: eventData.data, value})
        }).then(response => {
            return response.json();
        }).then(responseData => {
            return responseData;
        })
        this.inputEventAwait = null;
        this.bot.sendMessage(chatId, JSON.stringify(currencyResponce))
    }

    async setCurrencyMultiplierBuy(chatId, value, eventData) {
        const currencyResponce = await fetch(`${SERVER_URL}/currencyMultiplierBuy`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currenyName: eventData.data, value})
        }).then(response => {
            return response.json();
        }).then(responseData => {
            return responseData;
        })
        this.inputEventAwait = null;
        this.bot.sendMessage(chatId, JSON.stringify(currencyResponce))
    }

    async setCurrencyMultiplierSell(chatId, value, eventData) {
        const currencyResponce = await fetch(`${SERVER_URL}/currencyMultiplierSell`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currenyName: eventData.data, value})
        }).then(response => {
            return response.json();
        }).then(responseData => {
            return responseData;
        })
        this.inputEventAwait = null;
        this.bot.sendMessage(chatId, JSON.stringify(currencyResponce))
    }

    async setCurrencyReserves(chatId, value, eventData) {
        const currencyResponce = await fetch(`${SERVER_URL}/currencyReserves`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currenyName: eventData.data, value})
        }).then(response => {
            return response.json();
        }).then(responseData => {
            return responseData;
        })
        this.inputEventAwait = null;
        this.bot.sendMessage(chatId, JSON.stringify(currencyResponce))
    }

    async setCurrencyMinSum(chatId, value, eventData) {
        const currencyResponce = await fetch(`${SERVER_URL}/minExchange`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currenyName: eventData.data, value})
        }).then(response => {
            return response.json();
        }).then(responseData => {
            return responseData;
        })
        this.inputEventAwait = null;
        this.bot.sendMessage(chatId, JSON.stringify(currencyResponce))
    }

    async notifyUsers(text) {
        this.getUsersList().then(usersList => {
            for (const key in usersList) {
                const user = usersList[key];
                this.bot.sendMessage(user.id, `${getEmoji(EMOJI_NAMES.NOTIFICATION)} ${text}`);
            }
        })
    }

    async getUsersList() {
        return await fetch(SERVER_URL + `/usersList`)
            .then(response => {
                return response.json()
            }).then(data => {
                return data;
            });
    }

    clean() {
        this.bot.removeAllListeners();
        this.orderData = {
            selectedCurrencyForExchange: [],
            wallet: '',
            network: '',
            transactionID: '',
            status: '',
            network: '',
            timestamp: '',
            coupon: '',
            login: ''
        }
    }

}

const botController = new BotController(TOKEN);
botController.init()