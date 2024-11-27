# PlayWord

[![NPM Version](https://img.shields.io/npm/v/playword)](https://www.npmjs.com/package/playword)
[![Release Notes](https://img.shields.io/github/release/Foreverskyin0216/playword)](https://github.com/Foreverskyin0216/playword/releases)
[![CI](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml/badge.svg)](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml)
![Codecov](https://img.shields.io/codecov/c/github/Foreverskyin0216/playword)
[![GitHub License](https://img.shields.io/github/license/Foreverskyin0216/playword)](https://opensource.org/licenses/MIT)

Convert your intentions into Playwright actions with AI.

## 📦 Installation

Install `playword` with any package manager you prefer.

```bash
npm install playword
```

## 📝 Usage

Using PlayWord is very simple.

This package requires calling OpenAI API. Therefore, you first need to export your API key as an environment variable or pass it to `openAIOptions`.

```bash
export OPENAI_API_KEY="sk-..."
```

```typescript
const playword = new PlayWord(page, {
  openAIOptions: {
    apiKey: 'sk-...'
  }
})
```

See more details on getting the API key [here](https://platform.openai.com/api-keys).

### Use a custom endpoint

If you want to use a custom endpoint, pass the `apiKey` and `baseURL` to `openAIOptions`.

```typescript
const playword = new PlayWord(page, {
  openAIOptions: {
    apiKey: '<custom-api-key>',
    baseURL: '<custom-endpoint>'
  }
})
```

### 💬 Talk with browser

After setting up the API key, import this package and use it as shown below.

```typescript
import { chromium } from 'playwright'
import PlayWord from 'playword'

const browser = await chromium.launch()
const page = await browser.newPage()

// Pass the page you want to interact with to PlayWord
const playword = new PlayWord(page)

await playword.say('Navigate to https://www.google.com')

await playword.say('Input "Hello, World" in the search field')

await playword.say('Press Enter')
// Output: I pressed Enter, and the search results for "Hello, World" are now displayed. How can I assist you further?
```

No need to worry about how to locate elements or how to interact with them. PlayWord will take care of that for you.

### 🚀 Perform multiple actions in one sentence

If your input contains multiple actions, they will be executed in parallel.

**NOTE**: Since it is not possible to determine which step will be finished first, only use multiple actions under the premise that the order of execution does not matter.

```typescript
await playword.say('Navigate to https://github.com/')

await playword.say('Click the "Sign in" link')

await playword.say('Input "{EMAIL}" in the email field and "{PASSWORD}" in the password field')

await playword.say('Click the "Sign in" button')
```

### 🧪 assertion

Calling the method with sentences that start with specific keywords will be treated as assertions.

```typescript
import { test, expect } from '@playwright/test'
import PlayWord from 'playword'

test('An example of using PlayWord in a Playwright test', async ({ page }) => {
  const playword = new PlayWord(page)

  await playword.say('Navigate to https://www.google.com')

  await playword.say('Input "Hello, World" in the search field')

  await playword.say('Press Enter')

  const result = await playword.say('Check if the page contains "HELLO WORLD"')

  expect(result).toBe(true)
})
```

### 🔍 Assertion keywords

Keyword matching is used to determine if a step is an assertion, as it provides more stable results than AI judgment.

When a sentence starts with any of the following keywords, the intent is judged as an assertion: **(case insensitive)**

- assert
- assure
- check
- compare
- confirm
- ensure
- expect
- guarantee
- is
- match
- satisfy
- should
- test
- then
- validate
- verify

### 🔴 Recordings

PlayWord supports recording the execution and replaying it later by setting `record` to **true**.

The recorded actions will be saved in `.playword/recordings.json` by default.

```typescript
const playword = new PlayWord(page, { record: true })
```

Or set a custom path. (**Should end with .json**)

```typescript
const playword = new PlayWord(page, { record: 'path/to/recordings.json' })
```

After generating a recording using AI, you no longer need to consume tokens to execute your tests. Recordings can also be used as test code, allowing a test scenario to serve both as readable documentation and as executable tests.

If you don't want to use the recording in some steps, setting `withoutRecordings` to **true** will disable the recording for those steps.

```typescript
await playword.say('Input "Hello, World" in the search field', { withoutRecordings: true })
```

### 🔧 Debug mode

Enable debug mode by setting `debug` to **true**. This will print the AI's responses during execution.

```typescript
const playword = new PlayWord(page, { debug: true })
```

### 🔄 Retry on failure

Setting `retryOnFailure` to **true** will use AI to retry the failed action during replaying recordings.

```typescript
const playword = new PlayWord(page, { retryOnFailure: true })
```

### 📸 Screenshot reference

Screenshot reference helps AI understand the page state and better meet your needs. However, it will increase the cost of the OpenAI API and take longer to process.

To enable screenshot reference, set `useScreenshot` to **true**.

```typescript
const playword = new PlayWord(page, { useScreenshot: true })
```

### 🖼️ Handle frames

If you need to interact with frames, just tell PlayWord which frame you want to switch to.

```typescript
await playword.say('Go to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe')

await playword.say('Switch to the frame contains the street map')

await playword.say('Click the "zoom-in" button')

await playword.say('Click the "zoom-out" button')

await playword.say('Go back to the main page')
```

## 🤔 So why PlayWord?

| Aspect      | Traditional Testing                        | PlayWord                                        |
| ----------- | ------------------------------------------ | ----------------------------------------------- |
| Development | Need to locate elements for each action.   | Automatically locates elements with AI.         |
| Readability | Test code is not always easy to read.      | No need to read code. Just read the test cases. |
| Maintenance | Should maintain both test cases and code.  | Maintain only test cases.                       |
| Flexibility | Any changes in the code require updates.   | Changes can be automatically handled by AI.     |
| Debugging   | Need to trace the code and look into logs. | AI provides the reason for failure.             |

## 🤝 Compare PlayWord with other tools

| Criteria           | Auto-Playwright                   | ZeroStep            | PlayWord                            |
| ------------------ | --------------------------------- | ------------------- | ----------------------------------- |
| API                | OpenAI API                        | ZeroStep API        | OpenAI API                          |
| Snapshot           | HTML                              | Screenshots and DOM | HTML                                |
| Locator generation | By AI                             | CDP                 | RAG and screenshot reference        |
| Parallelism        | No                                | Yes                 | Yes, implemented by LangGraph       |
| Record and Replay  | No                                | No                  | Yes                                 |
| Intent detection   | Determined by AI                  | Determined by AI    | Determined by keywords and AI       |
| Supported Browsers | Any Playwright supported browsers | Chrome Only         | Any Playwright supported browsers   |
| Implementation     | Function calls                    | Function calls      | Class instantiation                 |
| Price              | Low (API tokens)                  | High (ZeroStep API) | Low (OpenAI API tokens)             |
| Token Consumption  | High (use full HTML)              | N/A                 | Low (use RAG results)               |
| License            | MIT                               | MIT                 | MIT                                 |

## 💡 Supported actions in PlayWord

Currently, PlayWord supports the following actions:

### Browser actions

- Click on elements
- Get attributes
- Hover over elements
- Input text in elements
- Navigate to URLs
- Press keys
- Scroll on the page
- Select options
- Switch to frames
- Sleep for a specific duration
- Wait for specific text to appear

### Assertion

- Assert the content of an element is equal to specific text
- Assert the content of an element is not equal to specific text
- Assert the element is visible
- Assert the element is not visible
- Assert the page contains specific text
- Assert the page does not contain specific text
- Assert the page title is equal to specific text
- Assert the URL matches specific RegExp patterns

### More actions will be supported in the future!
