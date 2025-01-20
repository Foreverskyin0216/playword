import { readFile } from 'fs/promises'
import { join } from 'path'
import { describe, test, expect } from 'vitest'
import { getElementLocations, sanitize } from '../../../packages/core/src/utils'

describe('Spec: HTML Utils', () => {
  describe('Given the getElementLocations function', () => {
    describe('And the HTML is sanitized', () => {
      describe('When it is called with a snapshot and target elements', () => {
        test('Then it should return the locations of the target elements', async () => {
          const pageContent = await readFile(join(__dirname, '../mocks/mockPageContent.html'), 'utf-8')
          const html = sanitize(pageContent)
          const locations = getElementLocations(html, ['a', 'div', 'head', 'p', 'script', 'style'])
          expect(locations).toEqual([
            {
              html: '<div id="app"></div>',
              xpath: '//html[1]/body[1]/div[1]'
            },
            {
              html: '<div id="targetDiv">ID</div>',
              xpath: '//html[1]/body[1]/div[1]/div[1]'
            },
            {
              html: '<div data-testid="testDiv">Test ID</div>',
              xpath: '//html[1]/body[1]/div[1]/div[2]'
            },
            {
              html: '<div data-qa="testQA">Test QA</div>',
              xpath: '//html[1]/body[1]/div[1]/div[3]'
            },
            {
              html: '<a href="https://test.url">Test URL</a>',
              xpath: '//html[1]/body[1]/div[1]/a[1]'
            },
            {
              html: '<div class="testClass">Test Class</div>',
              xpath: '//html[1]/body[1]/div[1]/div[4]'
            },
            {
              html: '<p>Text</p>',
              xpath: '//html[1]/body[1]/div[1]/p[1]'
            }
          ])
        })
      })
    })
  })
})
