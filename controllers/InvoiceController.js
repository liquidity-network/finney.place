const btoa = require('btoa');
const BigNumber = require('bignumber.js');
const JSONbig = require('json-bigint');
const Sqlite3 = require('sqlite3');
const Web3Utils = require("web3-utils");

let paintingManager;

const savePixels = function (pixels) {
    pixels.map((pixel) => {
        paintingManager.doPaint(paintingManager.getColourRGB(pixel.hex), pixel.x, pixel.y);
    })
};

const queryDatabase = function (invoice) {
    const db = new Sqlite3.Database('path/to/db.sqlite');
    const nonce = deriveReferenceNonce(invoice);

    return new Promise((resolve, reject) => {
        db.get(`SELECT nonce FROM transactions WHERE nonce=${nonce}`, (err, data) => {
            resolve(data !== undefined);
        })
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
                setTimeout(() => {hasTransactionBeenReceived(invoice, pixels, count-1)}, 10*1000)
            }
        })
};

const destinationChecksum = (invoiceDestination) => {
    const walletAddressesChecksums = invoiceDestination.walletAddresses.map(walletAddress => {
        return {
            type: 'bytes32', value: Web3Utils.soliditySha3({
                type: 'address', value: walletAddress
            })
        };
    });

    return Web3Utils.soliditySha3({
            type: 'uint256', value: invoiceDestination.networkId
        }, {
            type: 'bytes32', value: Web3Utils.soliditySha3({
                type: 'address', value: invoiceDestination.contractAddress
            })
        },
        ...walletAddressesChecksums
    );
};

const deriveReferenceNonce = (invoice) => {
    const destinationsChecksumTargets = invoice.destinations
        .map(destinationChecksum)
        .map(checksum => {
            return {type: 'bytes32', value: checksum};
        });

    const destinationsChecksum = Web3Utils.soliditySha3(...destinationsChecksumTargets);

    const invoiceChecksum = Web3Utils.soliditySha3(
        {type: 'bytes16', value: invoice.uuid},
        {type: 'bytes32', value: destinationsChecksum},
        {type: 'uint256', value: invoice.amount.toFixed(0)},
        {type: 'bytes4', value: invoice.currency},
        {type: 'bytes32', value: invoice.details},
    );

    const completeNonce = new BigNumber(invoiceChecksum);
    const fragment = new BigNumber(2).pow(32);

    return completeNonce.mod(fragment).toNumber();
};

exports.submitInvoice = function (req, res, next) {
    paintingManager = this.app.paintingManager;

    req.body.invoice.amount = new BigNumber(req.body.invoice.amount);
    hasTransactionBeenReceived(req.body.invoice, req.body.pixels, 60);

    let encodedInvoice = JSONbig.stringify(req.body.invoice);
    encodedInvoice = encodeURIComponent(btoa(encodedInvoice));

    res.send({ redirect: `https://wallet.liquidity.network/invoice?data=${encodedInvoice}` });
};
