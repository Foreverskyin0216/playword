import type { ElementLocation } from '../../packages/core/src/types'

import { readFile } from 'fs/promises'
import { join } from 'path'
import { beforeAll, describe, test, expect } from 'vitest'
import { getElementLocations, sanitize } from '../../packages/core/src/htmlUtils'

describe('Spec: HTML Utils', () => {
  describe('Given the getElementLocations function', () => {
    describe('And the HTML is sanitized', () => {
      let snapshot = ''

      beforeAll(async () => {
        const html = await readFile(join(__dirname, './mocks/mockPageContent.html'), 'utf-8')
        snapshot = sanitize(html)
      })

      describe('When it is called with a snapshot and target elements', () => {
        let locations: ElementLocation[]

        beforeAll(() => {
          locations = getElementLocations(snapshot, ['a', 'div', 'head', 'p', 'script', 'style'])
        })

        test('Then it should return the locations of the target elements', () => {
          expect(locations).toEqual([
            {
              element: '<div id="targetDiv">ID</div>',
              xpath: '//*[@id="targetDiv"]'
            },
            {
              element: '<div data-testid="testDiv">Test ID</div>',
              xpath: '//*[@data-testid="testDiv"]'
            },
            {
              element: '<div data-qa="testQA">Test QA</div>',
              xpath: '//*[@data-qa="testQA"]'
            },
            {
              element: '<a href="https://test.url">Test URL</a>',
              xpath: '//a[@href="https://test.url/"]'
            },
            {
              element: '<div class="testClass">Test Class</div>',
              xpath: '//div[@class="testClass" and text()="Test Class"]'
            },
            {
              element: '<p>Text</p>',
              xpath: '//html/body/div/p'
            }
          ])
        })
      })
    })
  })
})
