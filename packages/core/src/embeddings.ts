import type { VoyageEmbeddingsParams, VoyageRequest, VoyageResponse } from './types'

import { getEnvironmentVariable } from '@langchain/core/utils/env'
import { Embeddings } from '@langchain/core/embeddings'
import { chunkArray } from '@langchain/core/utils/chunk_array'
import fetch from 'node-fetch'

/** Implementation that generates embeddings using the Voyage AI API. */
export class VoyageEmbeddings extends Embeddings {
  /** The Voyage AI API key. */
  private apiKey?: string

  /** The headers for the request. */
  private headers = { 'Content-Type': 'application/json' }

  /**
   * The maximum number of documents to embed in a single request.
   *
   * This is limited by the Voyage AI API to a maximum of 8.
   *
   * @default 8
   */
  batchSize: number

  /**
   * The endpoint URL for the Voyage AI API.
   *
   * @default 'https://api.voyageai.com/v1/embeddings'
   */
  endpoint: string

  /**
   * Input type for the embeddings request. Can be "query", or "document".
   *
   * @default undefined
   */
  inputType?: 'query' | 'document'

  /**
   * The embeddings model to use.
   *
   * @default 'voyage-3'
   */
  model: string

  /**
   * The desired dimension of the output embeddings.
   *
   * @default undefined
   */
  outputDimension?: number

  /**
   * The data type of the output embeddings. Can be "float" or "int8".
   *
   * @default 'float'
   */
  outputDtype?: 'float' | 'int8'

  /**
   * Whether to truncate the input texts to the maximum length allowed by the model.
   *
   * @default true
   */
  truncation?: boolean

  constructor(params?: VoyageEmbeddingsParams) {
    super({ ...params })

    this.apiKey = params?.apiKey || getEnvironmentVariable('VOYAGEAI_API_KEY')
    this.batchSize = params?.batchSize ?? 8
    this.endpoint = params?.endpoint ?? 'https://api.voyageai.com/v1/embeddings'
    this.inputType = params?.inputType
    this.model = params?.model ?? 'voyage-3'
    this.outputDimension = params?.outputDimension
    this.outputDtype = params?.outputDtype ?? 'float'
    this.truncation = params?.truncation ?? true

    if (!this.apiKey) {
      throw new Error('Voyage AI API key not found')
    }
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const batches = chunkArray(documents, this.batchSize)

    const batchRequests = batches.map((batch) => {
      const request = {
        input: batch,
        input_type: this.inputType,
        model: this.model,
        output_dimension: this.outputDimension,
        output_dtype: this.outputDtype,
        truncation: this.truncation
      }

      return this.useVoyageAPI(request)
    })

    const batchResponses = await Promise.all(batchRequests)
    const vectors = batchResponses.flatMap(({ data }) => data.map(({ embedding }) => embedding))

    return vectors
  }

  async embedQuery(document: string): Promise<number[]> {
    const request = {
      input: document,
      input_type: this.inputType,
      model: this.model,
      output_dimension: this.outputDimension,
      output_dtype: this.outputDtype,
      truncation: this.truncation
    }

    const response = await this.useVoyageAPI(request)

    return response.data[0].embedding
  }

  /**
   * Makes a request to the Voyage AI API to generate embeddings for an array of texts.
   *
   * @param request - An object with properties to configure the request.
   */
  private async useVoyageAPI(request: VoyageRequest) {
    return this.caller.call(async () => {
      const payload = {
        body: JSON.stringify(request),
        headers: { Authorization: 'Bearer ' + this.apiKey, ...this.headers },
        method: 'POST'
      }

      const response = await fetch(this.endpoint, payload)

      return (await response.json()) as VoyageResponse
    })
  }
}
