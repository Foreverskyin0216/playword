# PlayWord

[![NPM Version](https://img.shields.io/npm/v/playword)](https://www.npmjs.com/package/playword)
[![Release Notes](https://img.shields.io/github/release/Foreverskyin0216/playword)](https://github.com/Foreverskyin0216/playword/releases)
[![CI](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml/badge.svg)](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml)
![Codecov](https://img.shields.io/codecov/c/github/Foreverskyin0216/playword)
[![GitHub License](https://img.shields.io/github/license/Foreverskyin0216/playword)](https://opensource.org/licenses/MIT)

Convert your intentions into Playwright actions with AI!

## 📦 Installation

Install `playword` package with any package manager you prefer.

```llvm
npm  add playword
yarn add playword
pnpm add playword
```

## 📝 Usage

Using PlayWord is very simple!

First, this package requires calling OpenAI API. You need to export your API key as an environment or pass it to PlayWord options. You can see more details on how to get the API key [here](https://platform.openai.com/api-keys).

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

### Use a custom endpoint

Pass the `baseURL` and the `apiKey` to PlayWord options to connect to a custom endpoint. You can also set other OpenAI options with this method.

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

const playword = new PlayWord(page)

await playword.say('Navigate to https://www.google.com')

await playword.say('Input "Hello, World" in the search field')

const output = await playword.say('Press Enter')
// Return the AI's response to the action

console.log(output)
// I pressed Enter, and the search results for "Hello, World" are now displayed. How can I assist you further?
```

No need to worry about how to locate elements or how to interact with them. PlayWord will take care of that for you!

### 🚀 Perform multiple actions in one sentence

When you include multiple actions in one sentence, PlayWord will execute them in parallel.

**NOTE**: Since it is not possible to determine which step will be executed first, please use multiple actions only under the premise that the order of execution does not matter.

```typescript
await playword.say('Navigate to https://www.google.com')

await playword.say('Input "Hello" in the search field and then input "World" in the search field')

await playword.say('Press Enter')
```

### 🧪 Assertion

PlayWord supports assertions as well!

Calling the method witn sentences that start with specific keywords will be treated as assertions.

```typescript
import { test, expect } from '@playwright/test'
import PlayWord from 'playword'

test('An example of using PlayWord in a Playwright test', async ({ page }) => {
  const playword = new PlayWord(page)

  await playword.say('Navigate to https://www.google.com')

  await playword.say('Input "Hello, World" in the search field')

  await playword.say('Press Enter')

  const result = await playword.say('Check if the page contains "HELLO WORLD"')
  // Return true or false for assertions

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

PlayWord supports recording your tests and replaying them later.

When setting `record` to **true**, PlayWord will record the execution and save it in `.playword/recordings.json` as default.

```typescript
const playword = new PlayWord(page, { record: true })
```

You can set a custom path as well. (**Should end with .json**)

```typescript
const playword = new PlayWord(page, { record: 'path/to/recordings.json' })
```

When the recording is complete and the test is run again in record mode, PlayWord will use the execution records from the recording for sentences that have the same **content** and **order**. If there are changes in order or content, it will switch back to using AI execution.

If you don't want to use the recording in some steps, you can disable it by setting the `withoutRecordings` option to **true**.

```typescript
await playword.say('Navigate to https://www.google.com', { withoutRecordings: true })
```

### 📸 Screenshot reference

PlayWord supports using screenshots to help AI understand the page state and better meet your needs!

**NOTE:** Using screenshot reference will increase the cost of the OpenAI API and take longer to process.

To enable screenshot reference, set `useScreenshot` to **true**.
```typescript
const playword = new PlayWord(page, { useScreenshot: true })
```
You can also disable it for a specific step by setting `withoutScreenshot` to **true**.

```typescript
await playword.say('Input "Hello, World" in the search field', { withoutScreenshot: true })
```

### 🔧 Debug mode

Enable debug mode by setting `debug` to **true**. This will automatically print the AI's response during execution.

```typescript
const playword = new PlayWord(page, { debug: true })
```

### 🖼️ Handle frames

If you need to interact with frames, you can tell PlayWord which frame you want to switch to.

```typescript
await playword.say('Go to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe')

await playword.say('Switch to the frame contains the street map')

await playword.say('Click the "zoom-in" button')

await playword.say('Click the "zoom-out" button')

await playword.say('Go back to the main page')
```

## 🤔 Why PlayWord?

| Aspect      | Traditional Testing                        | PlayWord                                        |
| ----------- | ------------------------------------------ | ----------------------------------------------- |
| Development | Need to locate elements for each action.   | Automatically locates elements with AI.         |
| Readability | Test code is not always easy to read.      | No need to read code. Just read the test cases. |
| Maintenance | Should maintain both test cases and code.  | Maintain only test cases.                       |
| Flexibility | Any changes in the code require updates.   | Changes can be automatically handled by AI.     |
| Debugging   | Need to trace the code and look into logs. | AI provides the reason for failure.             |

## Compare PlayWord with other tools

| Criteria           | Auto-Playwright                   | ZeroStep            | PlayWord                            |
| ------------------ | --------------------------------- | ------------------- | ----------------------------------- |
| API                | OpenAI API                        | ZeroStep API        | OpenAI API                          |
| Snapshot           | HTML                              | Screenshots and DOM | HTML and screenshots (optional)     |
| Locator generation | By AI                             | CDP                 | RAG and screenshot reference        |
| Parallelism        | No                                | Yes                 | Yes, implemented by LangGraph       |
| Record and Replay  | No                                | No                  | Yes                                 |
| Intent detection   | Determined by AI                  | Determined by AI    | Determined by keywords and AI       |
| Supported Browsers | Any Playwright supported browsers | Chrome Only         | Any Playwright supported browsers   |
| Implementation     | Function calls                    | Function calls      | Class instantiation                 |
| Price              | Low (OpenAI API tokens)           | High (ZeroStep API) | Low (OpenAI API tokens)             |
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
- Assert the element is visible
- Assert the page contains specific text
- Assert the page does not contain specific text
- Assert the page title is equal to specific text
- Assert the URL matches specific RegExp patterns

### More actions will be supported in the future!

## 🎉 Hope you enjoy using PlayWord!
