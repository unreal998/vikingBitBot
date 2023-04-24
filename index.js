import BotAPI from 'node-telegram-bot-api';
import fetch from "node-fetch";
import {
    MAIN_MENU_UI_CONTROLS_EVENT,
    SERVER_URL, CURRENCY_NAMES,
    TOKEN,
    CURRENCY_EVENT,
    ORDERS_EVENTS, EMOJI_NAMES
} from './src/constants.js';
import UIManager from './src/UIManager.js';
import {io} from "socket.io-client";
import {getEmoji} from "./src/utils.js";

class BotController {
    constructor(token) {
        this.bot = new BotAPI(token, { polling: true });
        this.commandList = [
            { command: '/start', description: 'start bot' }
        ];
        this.notificationMessageAwait = false;
        this.inputEventAwait = '';
        this.onMessageHandler = this.onMessageHandler.bind(this);
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
        this.authUser(msg).then(data => {
            if (data) {
                console.log(data)
                if (data.type === 'admin') {
                    UIManager.adminMainMenu(chatId, data);
                }
                else {
                    UIManager.userMainMenu(chatId, data)
                }
            } else {
                this.addNewUser(msg).then(data => {
                    console.log(data)
                    UIManager.userMainMenu(data.id, data)
                })
            }
        //         this.socket.emit('new-user', {chatId: chatId.toString()});
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
            console.log(response)
            return response.json()
        })
        .then(data => {
            console.log(data)
            return data
        })
        return this.userData;
    }

    async addNewUser(msg) {
        console.log(msg)
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


    addEventListeners() {
        this.bot.on('message', this.onMessageHandler);

        this.bot.on('callback_query', query => {
            const chatId = query.message.chat.id;
            if (typeof (query.data) === "string") {
                let dataParam = null;
                if (query.data.includes(CURRENCY_EVENT.SET_CURRENCY_VALUE)) {
                    let separateChatId = [...query.data.matchAll(/(SET_CURRENCY_VALUE)(.*)/gm)];
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
                }
                switch (query.data) {
                    case MAIN_MENU_UI_CONTROLS_EVENT.NOTIFICATION:
                        this.notificationMessageAwait = true;
                        UIManager.notifyMessageAwait(chatId)
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
                            UIManager.orderInfoUI(chatId, data);
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
                    default:
                        this.bot.sendMessage(chatId, "Выберите корректную кнопку");
                        break;
                }
            }
        })
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
                case CURRENCY_EVENT.SET_CURRENCY_VALUE:
                    this.setCurrencyValue(chatId, text, this.inputEventAwait)
                    break;
                case CURRENCY_EVENT.SET_CURRENCY_RESERVE:
                    this.setCurrencyReserves(chatId, text, this.inputEventAwait)
                    break;
                case CURRENCY_EVENT.SET_CURRENCY_MIN_SUM:
                    this.setCurrencyMinSum(chatId, text, this.inputEventAwait)
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
        const currencyList = await fetch(`${SERVER_URL}/orders`)
        .then(response => {
            return response.json();
        })
        .then(jsonData => {
            const pendingOrdersArray = [];
            for (const key in jsonData) {
                if (jsonData[key].status === 'pending') {
                    const element = jsonData[key];   
                    pendingOrdersArray.push(element);
                }
            }
            return pendingOrdersArray;
        })
        return currencyList;
    }

    async getOrderData(transactionID) {
        const orderData = await fetch(`${SERVER_URL}/orders?id=${transactionID}`)
        .then(response => {
            return response.json();
        })
        .then(jsonData => {
            console.log(jsonData)
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

    async setCurrencyValue(chatId, value, eventData) {
        const currencyResponce = await fetch(`${SERVER_URL}/currencyValue`, {
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
        console.log(currencyResponce)
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
    }

}

const botController = new BotController(TOKEN);
botController.init()