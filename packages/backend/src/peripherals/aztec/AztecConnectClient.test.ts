import { HttpClient, UnixTime } from '@l2beat/shared'
import { expect, mockObject } from 'earl'
import { Response } from 'node-fetch'

import { AztecConnectClient } from './AztecConnectClient'

const BASE_URL = 'base url'

describe(AztecConnectClient.name, () => {
  describe(AztecConnectClient.prototype.getBlock.name, () => {
    it('gets block', async () => {
      const mined = new Date()
      const httpClient = mockObject<HttpClient>({
        fetch: async () =>
          new Response(
            JSON.stringify({
              id: 42,
              mined,
              numTxs: 10,
            }),
          ),
      })
      const aztecClient = new AztecConnectClient(httpClient, BASE_URL)
      const result = await aztecClient.getBlock(42)
      expect(result).toEqual({
        number: 42,
        timestamp: UnixTime.fromDate(mined),
        transactionCount: 10,
      })
    })

    it('throws for invalid schema', async () => {
      const httpClient = mockObject<HttpClient>({
        fetch: async () => new Response(JSON.stringify({ foo: 'bar' })),
      })
      const client = new AztecConnectClient(httpClient, BASE_URL)
      await expect(client.getBlock(1)).toBeRejected()
    })

    it('throws for http errors', async () => {
      const httpClient = mockObject<HttpClient>({
        async fetch() {
          return new Response('foo', { status: 400 })
        },
      })
      const aztecClient = new AztecConnectClient(httpClient, BASE_URL)
      await expect(aztecClient.getBlock(1)).toBeRejected()
    })
  })

  describe(AztecConnectClient.prototype.getLatestBlock.name, () => {
    it('gets first mined block', async () => {
      const mined = new Date()
      const httpClient = mockObject<HttpClient>({
        fetch: async () =>
          new Response(
            JSON.stringify([
              {
                id: 3,
                mined: null,
                numTxs: 3,
              },
              {
                id: 2,
                mined: null,
                numTxs: 2,
              },
              {
                id: 1,
                mined,
                numTxs: 1,
              },
            ]),
          ),
      })
      const aztecClient = new AztecConnectClient(httpClient, BASE_URL)
      const result = await aztecClient.getLatestBlock()
      expect(result).toEqual({
        number: 1,
        timestamp: UnixTime.fromDate(mined),
        transactionCount: 1,
      })
    })

    it('throws for invalid schema', async () => {
      const httpClient = mockObject<HttpClient>({
        fetch: async () => new Response(JSON.stringify({ foo: 'bar' })),
      })
      const client = new AztecConnectClient(httpClient, BASE_URL)
      await expect(client.getLatestBlock()).toBeRejected()
    })

    it('throws for http errors', async () => {
      const httpClient = mockObject<HttpClient>({
        async fetch() {
          return new Response('foo', { status: 400 })
        },
      })
      const aztecClient = new AztecConnectClient(httpClient, BASE_URL)
      await expect(aztecClient.getLatestBlock()).toBeRejected()
    })

    it('throws if no mined block found', async () => {
      const httpClient = mockObject<HttpClient>({
        fetch: async () =>
          new Response(
            JSON.stringify([
              {
                id: 3,
                mined: null,
                numTxs: 3,
              },
              {
                id: 2,
                mined: null,
                numTxs: 2,
              },
              {
                id: 1,
                mined: null,
                numTxs: 1,
              },
            ]),
          ),
      })
      const aztecClient = new AztecConnectClient(httpClient, BASE_URL)
      await expect(aztecClient.getLatestBlock()).toBeRejected()
    })
  })
})
