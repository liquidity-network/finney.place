import BigNumber from 'bignumber.js'
export interface Invoice {
  network: number
  publicKey: string
  tokenAddress: string
  id?: string
  operatorAddress?: string
  amount?: BigNumber
  nonce?: number
}
export declare const deriveNonce: (invoice: Invoice) => number
export declare const createInvoice: (params: {
  network: number
  publicKey: string
  generateId?: boolean
  operatorAddress?: string
  tokenAddress?: string
  amount?: string | number | BigNumber
}) => Invoice
export declare const encodeInvoice: (invoice: Invoice) => string
export declare const decodeInvoice: (encoded: string) => Invoice
