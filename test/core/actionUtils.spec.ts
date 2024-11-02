import { JSDOM } from 'jsdom'
import { afterAll, beforeAll, describe, test, expect } from 'vitest'
import { markElement, unmarkElement } from '../../packages/core/src/actionUtils'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' })
globalThis.document = dom.window.document
globalThis.window = dom.window as unknown as Window & typeof globalThis

describe('Spec: Action Utils', () => {
  describe('Given the markElement function', () => {
    describe('When it is called with an element and an order', () => {
      const div = document.createElement('div')
      let span: HTMLSpanElement

      beforeAll(() => {
        document.body.appendChild(div)
        span = markElement(div, 1)
      })

      afterAll(() => {
        div.remove()
        span.remove()
      })

      test('Then it should return a span element', () => {
        expect(span.id).toBe('playword-label-1')
        expect(span.innerText).toBe('#1')
        expect(span.style.backgroundColor).toBe('black')
        expect(span.style.color).toBe('rgb(255, 215, 0)')
        expect(span.style.fontSize).toBe('24px')
        expect(span.style.fontWeight).toBe('bold')
        expect(span.style.padding).toBe('4px')
        expect(span.style.position).toBe('absolute')
        expect(span.style.top).toBe('-20px')
        expect(span.style.left).toBe('-40px')
        expect(span.style.zIndex).toBe('1000')
      })
    })
  })

  describe('Given the unmarkElement function', () => {
    let div: HTMLDivElement

    beforeAll(async () => {
      div = document.createElement('div')
      document.body.appendChild(div)
      markElement(div, 1)
      unmarkElement(1)
    })

    afterAll(() => div.remove())

    test('Then it should remove the span element', () => {
      const span = document.getElementById('playword-label-1')
      expect(span).toBeNull()
    })
  })
})
