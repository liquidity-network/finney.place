let paintingManager;

const savePixels = function (pixels) {
    pixels.map((pixel) => {
        paintingManager.doPaint(paintingManager.getColourRGB(pixel.hex), pixel.x, pixel.y);
    })
};

const hasTransactionBeenReceived = function (count, pixels) {
    if (count === 0) {
        return false;
    }

    // TODO: query the hub with this invoice
    // this promise is the query to the hub
    (new Promise((resolve) => {resolve(true)}))
        .then(received => {
            if (received) {
                // sign the invoice

                // save pixels
                savePixels(pixels);
            } else {
                setTimeout(() => {hasTransactionBeenReceived(count-1)}, 1000)
            }
        })
};

exports.submitInvoice = function (req, res, next) {
    paintingManager = this.app.paintingManager;
    let nonce = '0';

    hasTransactionBeenReceived(10, req.body.pixels);
    res.send({ redirect: 'https://wallet.liquidity.network' });
};
