import { describe, expect, test } from 'vitest'
import { classifier } from '../../../packages/core/src/tools'

describe('Spec: Classifier', () => {
  describe('Given the classifier tools', () => {
    const configurable = { action: { params: { attribute: 'mock-attribute' } } }
    const direction = 'top'
    const duration = 1000
    const option = 'mock-option'
    const pattern = 'mock-pattern'
    const text = 'mock-text'
    const url = 'mock-url'

    describe('When the AssertElementContains tool is used', () => {
      const assertElementContainsTool = classifier[0]

      test('Then the result should be the expected', async () => {
        const result = await assertElementContainsTool.invoke({ text }, { configurable })
        expect(result).toEqual({ name: 'assertElementContains', params: { attribute: 'mock-attribute', text } })
      })
    })

    describe('When the AssertElementNotContain is used', () => {
      const assertElementNotContainTool = classifier[1]

      test('Then the result should be the expected', async () => {
        const result = await assertElementNotContainTool.invoke({ text }, { configurable })
        expect(result).toEqual({ name: 'assertElementNotContain', params: { attribute: 'mock-attribute', text } })
      })
    })

    describe('When the AssertElementContentEquals tool is used', () => {
      const assertElementContentEqualsTool = classifier[2]

      test('Then the result should be the expected', async () => {
        const result = await assertElementContentEqualsTool.invoke({ text }, { configurable })
        expect(result).toEqual({ name: 'assertElementContentEquals', params: { attribute: 'mock-attribute', text } })
      })
    })

    describe('When the AssertElementContentNotEqual tool is used', () => {
      const assertElementContentNotEqualTool = classifier[3]

      test('Then the result should be the expected', async () => {
        const result = await assertElementContentNotEqualTool.invoke({ text }, { configurable })
        expect(result).toEqual({ name: 'assertElementContentNotEqual', params: { attribute: 'mock-attribute', text } })
      })
    })

    describe('When the AssertElementVisible tool is used', () => {
      const assertElementVisibleTool = classifier[4]

      test('Then the result should be the expected', async () => {
        const result = await assertElementVisibleTool.invoke({}, { configurable })
        expect(result).toEqual({ name: 'assertElementVisible', params: { attribute: 'mock-attribute' } })
      })
    })

    describe('When the AssertElementNotVisible tool is used', () => {
      const assertElementNotVisibleTool = classifier[5]

      test('Then the result should be the expected', async () => {
        const result = await assertElementNotVisibleTool.invoke({}, { configurable })
        expect(result).toEqual({ name: 'assertElementNotVisible', params: { attribute: 'mock-attribute' } })
      })
    })

    describe('When the AssertPageContains tool is used', () => {
      const assertPageContainsTool = classifier[6]

      test('Then the result should be the expected', async () => {
        const result = await assertPageContainsTool.invoke({ text })
        expect(result).toEqual({ name: 'assertPageContains', params: { text } })
      })
    })

    describe('When the AssertPageNotContain tool is used', () => {
      const assertPageNotContainTool = classifier[7]

      test('Then the result should be the expected', async () => {
        const result = await assertPageNotContainTool.invoke({ text })
        expect(result).toEqual({ name: 'assertPageNotContain', params: { text } })
      })
    })

    describe('When the AssertPageTitleEquals tool is used', () => {
      const assertPageTitleEqualsTool = classifier[8]

      test('Then the result should be the expected', async () => {
        const result = await assertPageTitleEqualsTool.invoke({ text })
        expect(result).toEqual({ name: 'assertPageTitleEquals', params: { text } })
      })
    })

    describe('When the AssertPageUrlMatches tool is used', () => {
      const assertPageUrlMatchesTool = classifier[9]

      test('Then the result should be the expected', async () => {
        const result = await assertPageUrlMatchesTool.invoke({ pattern })
        expect(result).toEqual({ name: 'assertPageUrlMatches', params: { pattern } })
      })
    })

    describe('When the Click tool is used', () => {
      const clickTool = classifier[10]

      test('Then the result should be the expected', async () => {
        const result = await clickTool.invoke({}, { configurable })
        expect(result).toEqual({ name: 'click', params: { attribute: 'mock-attribute' } })
      })
    })

    describe('When the GoTo tool is used', () => {
      const goToTool = classifier[11]

      test('Then the result should be the expected', async () => {
        const result = await goToTool.invoke({ url })
        expect(result).toEqual({ name: 'goto', params: { url } })
      })
    })

    describe('When the Hover tool is used', () => {
      const hoverTool = classifier[12]

      test('Then the result should be the expected', async () => {
        const result = await hoverTool.invoke({ duration }, { configurable })
        expect(result).toEqual({ name: 'hover', params: { attribute: 'mock-attribute', duration } })
      })
    })

    describe('When the Input tool is used', () => {
      const inputTool = classifier[13]

      test('Then the result should be the expected', async () => {
        const result = await inputTool.invoke({ text }, { configurable })
        expect(result).toEqual({ name: 'input', params: { attribute: 'mock-attribute', text } })
      })
    })

    describe('When the Scroll tool is used', () => {
      const scrollTool = classifier[14]

      test('Then the result should be the expected', async () => {
        const result = await scrollTool.invoke({ direction }, { configurable })
        expect(result).toEqual({ name: 'scroll', params: { attribute: 'mock-attribute', direction } })
      })
    })

    describe('When the Select tool is used', () => {
      const selectTool = classifier[15]

      test('Then the result should be the expected', async () => {
        const result = await selectTool.invoke({ option }, { configurable })
        expect(result).toEqual({ name: 'select', params: { attribute: 'mock-attribute', option } })
      })
    })

    describe('When the Sleep tool is used', () => {
      const sleepTool = classifier[16]

      test('Then the result should be the expected', async () => {
        const result = await sleepTool.invoke({ duration })
        expect(result).toEqual({ name: 'sleep', params: { duration } })
      })
    })

    describe('When the WaitForText tool is used', () => {
      const waitForTextTool = classifier[17]

      test('Then the result should be the expected', async () => {
        const result = await waitForTextTool.invoke({ text }, { configurable })
        expect(result).toEqual({ name: 'waitForText', params: { text } })
      })
    })
  })
})
