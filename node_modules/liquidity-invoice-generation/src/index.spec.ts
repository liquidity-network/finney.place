import BigNumber from 'bignumber.js'

import { createInvoice, encodeInvoice, decodeInvoice, Invoice } from './index'

jest.mock('uuid/v4', () => () => '10000000-0000-0000-0000-000000000001')

describe('Invoice generation unit tests', () => {
  it('should correctly generate, encode and decode invoice with properties set #1', () => {
    testInvoice(
      {
        network: 1,
        operatorAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
        publicKey: '0xE6987CD613Dfda0995A95b3E6acBAbECecd41376',
      },
      {
        network: 1,
        publicKey: '0xE6987CD613Dfda0995A95b3E6acBAbECecd41376',
        tokenAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
        operatorAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
      },
    )
  })

  it('should correctly generate, encode and decode invoice with properties set #2', () => {
    testInvoice(
      {
        network: 1,
        operatorAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
        publicKey: '0xE6987CD613Dfda0995A95b3E6acBAbECecd41376',
        amount: '1000000000',
      },
      {
        network: 1,
        publicKey: '0xE6987CD613Dfda0995A95b3E6acBAbECecd41376',
        tokenAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
        operatorAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
        amount: new BigNumber('1000000000'),
      },
    )
  })

  it('should correctly generate, encode and decode invoice with properties set #3', () => {
    testInvoice(
      {
        network: 1,
        tokenAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
        operatorAddress: '0x76D7a535B51f658Ef6fb46b24CF2B0c27f3501eE',
        publicKey: '0xE6987CD613Dfda0995A95b3E6acBAbECecd41376',
      },
      {
        network: 1,
        publicKey: '0xE6987CD613Dfda0995A95b3E6acBAbECecd41376',
        tokenAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
        operatorAddress: '0x76D7a535B51f658Ef6fb46b24CF2B0c27f3501eE',
      },
    )
  })

  it('should correctly generate, encode and decode invoice with properties set #4', () => {
    testInvoice(
      {
        network: 1,
        tokenAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
        operatorAddress: '0x76D7a535B51f658Ef6fb46b24CF2B0c27f3501eE',
        publicKey: '0xE6987CD613Dfda0995A95b3E6acBAbECecd41376',
        generateId: true,
        amount: '1000000000',
      },
      {
        network: 1,
        publicKey: '0xE6987CD613Dfda0995A95b3E6acBAbECecd41376',
        tokenAddress: '0x4FED1fC4144c223aE3C1553be203cDFcbD38C581',
        operatorAddress: '0x76D7a535B51f658Ef6fb46b24CF2B0c27f3501eE',
        amount: new BigNumber('1000000000'),
        id: '10000000000000000000000000000001',
        nonce: 1158935742,
      },
    )
  })

  // // compressAmount test cases
  // it('compressAmount #1', () => expect(compressAmount('1230000000000000000')).toEqual('123^16'))
  // it('compressAmount #2', () => expect(compressAmount('123000')).toEqual('123^3'))
  // it('compressAmount #3', () => expect(compressAmount('1000000000')).toEqual('1^9'))
  // it('compressAmount #4', () => expect(compressAmount('1230')).toEqual('1230'))
  // it('compressAmount #5', () => expect(compressAmount('12300')).toEqual('12300'))
  // it('compressAmount #6', () => expect(compressAmount('123456')).toEqual('123456'))
  // it('compressAmount #7', () => expect(compressAmount('0')).toEqual('0'))

  // decompressAmount test cases
  // it('decompressAmount #1', () => expect(decompressAmount('123^16')).toEqual('1230000000000000000'))
  // it('decompressAmount #2', () => expect(decompressAmount('123^3')).toEqual('123000'))
  // it('decompressAmount #3', () => expect(decompressAmount('1230')).toEqual('1230'))
  // it('decompressAmount #4', () => expect(decompressAmount('12300')).toEqual('12300'))
  // it('decompressAmount #5', () => expect(decompressAmount('123456')).toEqual('123456'))
  // it('decompressAmount #6', () => expect(decompressAmount('0')).toEqual('0'))

  function testInvoice(params, targetInvoice: Invoice) {
    const invoice = createInvoice(params)

    expect(invoice).toEqual(targetInvoice)

    expect(decodeInvoice(encodeInvoice(invoice))).toEqual(invoice)
  }
})
