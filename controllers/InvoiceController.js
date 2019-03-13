const { encodeInvoice } = require('liquidity-invoice-generation');
// const Sqlite3 = require('sqlite3');

let paintingManager;
let webSocketServer;
const fs = require('fs');

const savePixels = function (pixels) {
    pixels.map((pixel) => {
        paintingManager.doPaint(paintingManager.getColourRGB(pixel.hex), pixel.x, pixel.y);
    });
    webSocketServer.broadcast('order_received', { pixels: pixels });
};

const queryDatabase = function (invoice) {
    // const db = new Sqlite3.Database('path/to/db.sqlite');
    const nonce = invoice.nonce;
    const amount = invoice.amount.toFixed(0);

    return new Promise((resolve, reject) => {
        // db.get(`SELECT nonce FROM transactions WHERE nonce=${nonce}`, (err, data) => {
        //     resolve(data !== undefined);
        // })

        fs.readFile('tx-db.json', 'utf8', function (err, data) {
            if (err) {
                return reject(err);
            }

            try {
                const txMap = new Map(JSON.parse(data));
                for (let txId of txMap.keys()) {
                    const confirmedTransfer = txMap.get(txId);

                    if (confirmedTransfer[0] == nonce && confirmedTransfer[1] == amount) {
                        return resolve(true);
                    }
                }
                return resolve(false);
            } catch (e) {
                console.log(`Error Loading TX-DB: ${e}`);
                return resolve(false);
            }
        });
    })
};

const hasTransactionBeenReceived = function (invoice, pixels, count) {
    if (count === 0) {
        return false;
    }

    queryDatabase(invoice)
        .then(received => {
            if (received) {
                savePixels(pixels);
            } else {
                setTimeout(() => {hasTransactionBeenReceived(invoice, pixels, count-1)}, 1000)
            }
        })
};

exports.submitInvoice = function (req, res, next) {
    paintingManager = this.app.paintingManager;
    webSocketServer = req.place.websocketServer;

    hasTransactionBeenReceived(req.body.invoice, req.body.pixels, 3 * 24* 60* 60); // 3 days

    res.send({ redirect: `https://wallet.liquidity.network/invoice?data=${encodeInvoice(req.body.invoice)}` });
};
