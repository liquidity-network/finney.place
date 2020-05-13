import { soliditySha3 } from 'web3-utils'
import BigNumber from 'bignumber.js'
import uuid from 'uuid/v4'

export interface Invoice {
  network: number
  publicKey: string
  tokenAddress: string
  // If invoice has id, there should be single transaction paying it,
  // that will be tracked by invoice issuer by nonce.
  id?: string
  // If there is no operatorAddress, invoice is for on-chain payment
  operatorAddress?: string
  amount?: BigNumber
  nonce?: number
}

export const deriveNonce = (invoice: Invoice): number => {
  const invoiceChecksum = soliditySha3(
    { type: 'bytes16', value: invoice.id },
    { type: 'uint256', value: invoice.network.toString() },
    { type: 'bytes32', value: invoice.operatorAddress },
    { type: 'bytes32', value: invoice.publicKey },
    { type: 'uint256', value: invoice.amount.toFixed(0) },
    { type: 'bytes32', value: invoice.tokenAddress },
  )

  const completeNonce = new BigNumber(invoiceChecksum)
  const fragment = new BigNumber(2).pow(32)

  return completeNonce.mod(fragment).toNumber()
}

export const createInvoice = (params: {
  network: number
  publicKey: string
  generateId?: boolean
  operatorAddress?: string
  tokenAddress?: string
  amount?: number | string | BigNumber
}): Invoice => {
  if (!params.tokenAddress && !params.operatorAddress) {
    throw new Error('Either tokenAddress or operatorAddress should be non-null')
  }

  if (params.generateId && !params.amount) {
    throw new Error('Invoices with id should contain amount property')
  }

  const invoice: Invoice = {
    network: params.network,
    publicKey: params.publicKey,
    tokenAddress: params.tokenAddress || params.operatorAddress,
  }

  if (params.operatorAddress) invoice.operatorAddress = params.operatorAddress

  if (params.amount) invoice.amount = new BigNumber(params.amount)

  if (params.generateId) {
    invoice.id = uuid()
      .split('-')
      .join('')

    invoice.nonce = deriveNonce(invoice)
  }

  return invoice
}

export const encodeInvoice = (invoice: Invoice): string => {
  const data = [invoice.network, invoice.publicKey]

  if (invoice.id) data.push(invoice.id)

  data.push(invoice.tokenAddress)

  if (invoice.operatorAddress) data.push(invoice.operatorAddress)

  if (invoice.amount) data.push(compressAmount(invoice.amount.toString()))

  return INVOICE_PREFIX + data.join('|')
}

export const decodeInvoice = (encoded: string): Invoice => {
  const data = encoded.substring(INVOICE_PREFIX.length).split('|')

  const invoice: Invoice = {
    network: Number.parseInt(data.shift()),
    publicKey: data.shift(),
    tokenAddress: undefined,
  }

  let nextPiece = data.shift()

  if (nextPiece.substr(0, 2) !== '0x') {
    invoice.id = nextPiece

    nextPiece = data.shift()
  }

  invoice.tokenAddress = nextPiece

  if (data.length === 0) return invoice

  nextPiece = data.shift()

  if (nextPiece.substr(0, 2) === '0x') {
    invoice.operatorAddress = nextPiece

    if (data.length > 0) {
      invoice.amount = new BigNumber(decompressAmount(data.shift()))
    }
  } else {
    invoice.amount = new BigNumber(nextPiece)
  }

  if (invoice.id) invoice.nonce = deriveNonce(invoice)

  return invoice
}

const compressAmount = (amount: string): string => {
  for (let i = amount.length - 1; i >= 0; i--) {
    if (amount[i] !== '0') {
      const zerosAmount = amount.length - i - 1
      return zerosAmount > 2 ? amount.substring(0, i + 1) + '^' + zerosAmount.toString() : amount
    }
  }
  return amount
}

const decompressAmount = (amount: string): string => {
  const caretPosition = amount.indexOf('^')

  return caretPosition === -1
    ? amount
    : amount.substring(0, caretPosition) +
        '0'.repeat(Number.parseInt(amount.substring(caretPosition + 1)))
}

const INVOICE_PREFIX = 'LQI'
