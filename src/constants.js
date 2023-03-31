//TEST
const SERVER_URL = 'http://localhost:3003'

const EMOJI_NAMES = {
    MY_LINKS: 'myLinks',
    REMOVE_LINK: 'delete',
    SETTINGS: 'settings',
    CREATE_LINK: 'createLink',
    CHANGE_NAME: 'changeName',
    CHANGE_PRICE: 'changePrice',
    BACK_TO_MAIN_MENU: 'backToMainMenu',
    SEND_MESSAGE: 'sendMessage',
    EXCLAMATION: 'exclamation',
    YES: 'yes',
    NO: 'no',
    LINK: 'LINK',
    NOTIFICATION: 'NOTIFICATION'
}

const MAIN_MENU_UI_CONTROLS_EVENT = {
    CREATE_EXCHANGE_REQUEST: 'CREATE_EXCHANGE_REQUEST',
    CHAT: 'CHAT',
    BOT_INFO: 'BOT_INFO',
    SET_CURRENCY_VALUE: 'SET_CURRENCY_VALUE',
    NOTIFICATION: 'NOTIFICATION'
}

const SET_CURRENCY_EVENT = {
    USDT: 'USDT',
    USDS: 'USDS',
    EUR: 'EUR',
    USD: 'USD',
    BTC: 'BTC',
    ETH: 'ETH',
}

const TOKEN = "5835524201:AAELin9i9ZXASMtObwVA9RGiUD8IJ2joBFA";

export {
    EMOJI_NAMES,
    TOKEN,
    SERVER_URL,
    MAIN_MENU_UI_CONTROLS_EVENT,
    SET_CURRENCY_EVENT
}