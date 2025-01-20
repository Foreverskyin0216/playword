/**
 * This is a simple implementation of the memory vector store.
 *
 * **Reference**
 *
 * https://github.com/langchain-ai/langchainjs/blob/main/langchain/src/vectorstores/memory.ts
 */
import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import type { MemoryVector } from './types'

import { Document } from '@langchain/core/documents'
import { VectorStore } from '@langchain/core/vectorstores'

/**
 * In-memory, ephemeral vector store.
 */
export class MemoryVectorStore extends VectorStore {
  /**
   * Array of vectors stored in memory.
   */
  vectors: MemoryVector[] = []

  constructor(embeddings: EmbeddingsInterface) {
    super(embeddings, {})
  }

  /**
   * Defines the type of vector store.
   *
   * @returns 'memory' as the type of vector store.
   */
  _vectorstoreType() {
    return 'memory'
  }

  /**
   * Static method to create a `MemoryVectorStore` instance from an array of
   * `Document` instances. It adds the documents to the store.
   *
   * @param docs Array of `Document` instances to be added to the store.
   * @param embeddings `Embeddings` instance used to generate embeddings for the documents.
   *
   * @returns Promise that resolves with a new `MemoryVectorStore` instance.
   */
  static async fromDocuments(docs: Document[], embeddings: EmbeddingsInterface) {
    const store = new MemoryVectorStore(embeddings)
    await store.addDocuments(docs)
    return store
  }

  /**
   * Static method to create a `MemoryVectorStore` instance from an array of
   * texts. It creates a `Document` for each text and metadata pair, and
   * adds them to the store.
   *
   * @param texts Array of texts to be added to the store.
   * @param embeddings `Embeddings` instance used to generate embeddings for texts.
   *
   * @returns Promise that resolves with a new `MemoryVectorStore` instance.
   */
  static async fromTexts(texts: string[], embeddings: EmbeddingsInterface) {
    const documents = texts.map((text) => new Document({ pageContent: text }))
    return this.fromDocuments(documents, embeddings)
  }

  /**
   * The method to query vectors in the memory vector store.
   * It calculates the cosine similarity between the query vector and each vector in the store,
   * sorts the results by similarity, and returns the top `k` results.
   *
   * @param query The query vector to compare against the vectors in the store.
   * @param k The number of top results to return.
   *
   * @returns Promise that resolves with an array of `MemoryVector`. See {@link MemoryVector} for details.
   */
  protected async _queryVectors(query: number[], k: number) {
    return this.vectors
      .map(({ content, embedding }, index) => ({
        index,
        content,
        embedding,
        similarity: this.cosine(query, embedding)
      }))
      .sort((a, b) => (a.similarity > b.similarity ? -1 : 0))
      .slice(0, k)
  }

  /**
   * Returns the average of cosine distances between vectors a and b.
   *
   * @param a The first vector
   * @param b The second vector
   */
  private cosine(a: number[], b: number[]) {
    let [p, p2, q2] = [0, 0, 0]
    for (let i = 0; i < a.length; i++) {
      p += a[i] * b[i]
      p2 += a[i] * a[i]
      q2 += b[i] * b[i]
    }
    return p / (Math.sqrt(p2) * Math.sqrt(q2))
  }

  /**
   * Method to add documents to the memory vector store. It extracts the
   * text from each document, generates embeddings for them, and adds the
   * resulting vectors to the store.
   *
   * @param documents The array of `Document` instances to be added to the store.
   *
   * @returns Promise that resolves when all documents have been added.
   */
  async addDocuments(documents: Document[]) {
    const texts = documents.map(({ pageContent }) => pageContent)
    return this.addVectors(await this.embeddings.embedDocuments(texts), documents)
  }

  /**
   * Method to add vectors to the memory vector store. It creates
   * `MemoryVector` instances for each vector and document pair and adds
   * them to the store.
   *
   * @param vectors The array of vectors to be added to the store.
   * @param documents The array of `Document` instances corresponding to the vectors. See {@link Document} for details.
   *
   * @returns Promise that resolves when all vectors have been added.
   */
  async addVectors(vectors: number[][], documents: Document[]) {
    const memoryVectors = vectors.map((embedding, index) => ({ content: documents[index].pageContent, embedding }))
    this.vectors.push(...memoryVectors)
  }

  /**
   * Method to perform a similarity search in the memory vector store. It
   * calculates the similarity between the query vector and each vector in
   * the store, sorts the results by similarity, and returns the top `k`
   * results along with their scores.
   *
   * @param query The query vector to compare against the vectors in the store.
   * @param topN The number of top results to return.
   *
   * @returns Promise that resolves with an array of tuples, each containing a `Document` and its similarity score.
   */
  async similaritySearchVectorWithScore(query: number[], topN: number) {
    const vectors = await this._queryVectors(query, topN)
    return vectors.map((v) => [new Document({ pageContent: v.content }), v.similarity]) as [Document, number][]
  }
}
