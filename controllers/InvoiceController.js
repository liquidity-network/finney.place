const { encodeInvoice } = require('liquidity-invoice-generation');
const btoa = require('btoa');
const JSONbig = require('json-bigint');
const { NOCUSTManager } = require('nocust-client')
const Web3 = require('web3')
const BigNumber = require('bignumber.js');

let paintingManager;
let webSocketServer;
const fs = require('fs');


const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_NODE_URL));
const nocustManager = new NOCUSTManager({
    rpcApi: web3,
    operatorApiUrl: process.env.HUB_PROVIDER_URL,
    contractAddress: process.env.HUB_CONTRACT_ADDRESS,
    });
const pendingInvoices = new Map()
const PRICE_PER_PIXEL = new BigNumber(1).shiftedBy(12)

const unsub = nocustManager.subscribeToIncomingTransfer(process.env.FINNEY_PLACE_ADDRESS, tx => {
    console.log(`Incoming transaction from ${tx.wallet.address} of ${tx.amount}, nonce ${tx.nonce}`)

    if(pendingInvoices.has(parseInt(tx.nonce)) && pendingInvoices.get(parseInt(tx.nonce)).amount == tx.amount) {
        const {pixels} = pendingInvoices.get(parseInt(tx.nonce))
        const pixelsCount = pixels.filter((px) => px.hex !== px.prevHex).length;
        const amountValid = tx.amount >=  PRICE_PER_PIXEL * pixelsCount;
        if(amountValid){
            console.log("Invoice matched")
            savePixels(pendingInvoices.get(parseInt(tx.nonce)).pixels)
        }
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
