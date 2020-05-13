# liquidity-invoice-generation
Invoice generation system compatible with Liquidity Network

**IMPORTANT** Requires `web3-utils` and `bignumber.js` dependencies

### Usage

```typescript
const invoice: Invoice = createInvoice({
  network: 4, // Network id
  publicKey: '0xE6987CD613Dfda0995A95b3E6acBAbECecd41376', // public key of recipient
  // Generate unique id for invoice, payment by this invoice can be tracked by nonce which is derived by
  // invoice's id and amount. If id is not generated, then the invoice can be used multiple times.
  generateId: true,
  // Address of the operator, if not defined, on-chain invoice will be generated.
  operatorAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
  tokenAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581', // Token address, if not defined, operator address applied.
  amount: '12000000000000', // Optional. BigNumber or number also can be used.
})

const encodedInvoice: string = encodeInvoice(invoice) // Used to generate QR code

const decodedInvoice: Invoice = decodeInvoice(encodedInvoice) // Decode invoice after QR code scanning
```
