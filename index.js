import BotAPI from 'node-telegram-bot-api';
import fetch from "node-fetch";
import {
    MAIN_MENU_UI_CONTROLS_EVENT,
    SERVER_URL, SET_CURRENCY_EVENT,
    TOKEN
} from './src/constants.js';
import UIManager from './src/UIManager.js';
import {io} from "socket.io-client";

class BotController {
    constructor(token) {
        this.bot = new BotAPI(token, { polling: true });
        this.commandList = [
            { command: '/start', description: 'start bot' }
        ];
        this.notificationMessageAwait = false;
        this.currencyAwait = false;
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
        // this.authUser(msg).then(data => {
        //         this.socket.emit('new-user', {chatId: chatId.toString()});
                UIManager.adminMainMenu(chatId, chatData);
        // });
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


    addEventListeners() {
        this.bot.on('message', this.onMessageHandler);

        this.bot.on('callback_query', query => {
            const chatId = query.message.chat.id;
            if (typeof (query.data) === "string") {
                switch (query.data) {
                    case MAIN_MENU_UI_CONTROLS_EVENT.NOTIFICATION:
                        this.notificationMessageAwait = true;
                        UIManager.notifyMessageAwait(chatId)
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.SET_CURRENCY_VALUE:
                        UIManager.setCurrencyValueUI(chatId)
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.SET_CURRENCY_MIN_SUM:
                        UIManager.setCurrencyMinSumUI(chatId)
                        break;
                    case MAIN_MENU_UI_CONTROLS_EVENT.SET_CURRENCY_RESERVE:
                        UIManager.setCurrencyReserveUI(chatId)
                        break;
                    case SET_CURRENCY_EVENT[query.data]:
                        this.currencyAwait = true;
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
        if (this.currencyAwait) {
            this.setCurrencyValue(chatId, text)
        }

        this.bot.sendMessage(chatId, 'I don`t understand you motherfucker');
    }

    async setCurrencyValue(chatId, value) {
        const currencyResponce = await fetch(`${SERVER_URL}/currencyValue`, {
            method: "POST",
            body: JSON.stringify({value})
        }).then(response => {
            return response.json();
        }).then(moreResponsiveResponse => {
            return moreResponsiveResponse;
        })
        this.bot.sendMessage(chatId, currencyResponce.text)
    }


    async notifyUsers(text) {
        this.getUsersList().then(usersList => {
            for (const key in usersList) {
                const user = usersList[key];
                this.bot.sendMessage(user.id, text);
            }
        })
    }


    clean() {
        this.bot.removeAllListeners();
    }

}

const botController = new BotController(TOKEN);
botController.init()