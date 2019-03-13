const { encodeInvoice } = require('liquidity-invoice-generation');
const btoa = require('btoa');
const JSONbig = require('json-bigint');
const { NocustManager } = require('nocust-client')
const Web3 = require('web3')

let paintingManager;
let webSocketServer;
const fs = require('fs');


const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_NODE_URL));
const nocustManager = new NocustManager({
    rpcApi: web3,
    hubApiUrl: process.env.HUB_PROVIDER_URL,
    contractAddress: process.env.HUB_CONTRACT_ADDRESS,
    });
const pendingInvoices = new Map()

const unsub = nocustManager.subscribeToIncomingTransfer(process.env.FINNEY_PLACE_ADDRESS, tx => {
    console.log(`Incoming transaction from ${tx.wallet.address} of ${tx.amount}, nonce ${tx.nonce}`)

    if(pendingInvoices.has(parseInt(tx.nonce)) && pendingInvoices.get(parseInt(tx.nonce)).amount == tx.amount) {
        console.log("Invoice matched")
        savePixels(pendingInvoices.get(parseInt(tx.nonce)).pixels)
    }
})

const savePixels = function (pixels) {
    pixels.map((pixel) => {
        paintingManager.doPaint(paintingManager.getColourRGB(pixel.hex), pixel.x, pixel.y);
    });
    webSocketServer.broadcast('order_received', { pixels: pixels });
};

exports.submitInvoice = function (req, res, next) {
    paintingManager = this.app.paintingManager;
    webSocketServer = req.place.websocketServer;
    
    const nonce = req.body.invoice.nonce;
    const amount = req.body.invoice.amount.toFixed(0);
    console.log(`Invoice submited, nonce: ${nonce}, for amount ${amount}`)
    
    pendingInvoices.set(nonce, {amount: amount, pixels: req.body.pixels})
    
    res.send({ redirect: `https://wallet.liquidity.network/invoice?data=${encodeInvoice(req.body.invoice)}` });
};
