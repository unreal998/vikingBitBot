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
    NOTIFICATION: 'NOTIFICATION',
    RESERVED: 'RESERVED',
    LIST: 'LIST',
    DETAIL: 'DETAIL',
    DOWN: 'DOWN',
    USD: 'USD',
    EUR: 'EUR',
    CARD: 'CARD',
    MONEY: 'MONEY',
}

const CURRENCY_EVENT = {
    SET_CURRENCY_VALUE: 'SET_CURRENCY_VALUE',
    SET_CURRENCY_MIN_SUM: 'SET_CURRENCY_MIN_SUM',
    SET_CURRENCY_RESERVE: 'SET_CURRENCY_RESERVE',
}

const ORDERS_EVENTS = {
    ORDER_INFO: 'ORDER_INFO',
    ORDER_REJECT: 'ORDER_REJECT',
    ORDER_CONFIRM: 'ORDER_CONFIRM'
}

const MAIN_MENU_UI_CONTROLS_EVENT = {
    CREATE_EXCHANGE_REQUEST: 'CREATE_EXCHANGE_REQUEST',
    CHAT: 'CHAT',
    BOT_INFO: 'BOT_INFO',
    NOTIFICATION: 'NOTIFICATION',
    GET_CURRENCY_VALUES: 'GET_CURRENCY_VALUES',
    GET_CURRENCY_LIST: 'GET_CURRENCY_LIST',
    GET_PENDING_ORDERS_DATA: 'GET_PENDING_ORDERS_DATA'
}

const USER_ROLES = {
    ADMIN: 'admin',
    WORKER: 'worker',
    VBIVER: 'vbiver',
    REJECTED: 'rejected'
}

const CURRENCY_NAMES = {
    USDT: 'USDT',
    USDC: 'USDC',
    EUR: 'EUR',
    USD: 'USD',
    BTC: 'BTC',
    ETH: 'ETH',
    UAH: 'UAH',
}

const TOKEN = "5835524201:AAELin9i9ZXASMtObwVA9RGiUD8IJ2joBFA";

export {
    EMOJI_NAMES,
    TOKEN,
    SERVER_URL,
    MAIN_MENU_UI_CONTROLS_EVENT,
    CURRENCY_EVENT,
    CURRENCY_NAMES,
    ORDERS_EVENTS,
    USER_ROLES
}