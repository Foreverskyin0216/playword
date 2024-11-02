# PlayWord

[![NPM Version](https://img.shields.io/npm/v/@playword/core)](https://www.npmjs.com/package/playword)
[![Release Notes](https://img.shields.io/github/release/Foreverskyin0216/playword)](https://github.com/Foreverskyin0216/playword/releases)
[![CI](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml/badge.svg)](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml)
![Codecov](https://img.shields.io/codecov/c/github/Foreverskyin0216/playword)
[![GitHub License](https://img.shields.io/github/license/Foreverskyin0216/playword)](https://opensource.org/licenses/MIT)

Turn your ideas into executable actions on the web, bringing more fun and productivity to your testing!

## 📦 Installation

Install playword with any package manager you prefer.

```sh
# npm
npm install @playword/core
# yarn
yarn add @playword/core
```

## 📝 Usage

PlayWord is very straightforward to use.

This package requires calling OpenAI API. You first need to export your API key as an environment variable.

```bash
export OPENAI_API_KEY="sk-..."
```

Or pass it to `openAIOptions`.

```typescript
// Set the API Key with the default endpoint
const playword = new PlayWord(page, {
  openAIOptions: {
    apiKey: 'sk-...'
  }
})

// Use your own endpoint
const playword = new PlayWord(page, {
  openAIOptions: {
    apiKey: 'sk-...',
    baseURL: 'https://your-endpoint'
  }
})
```

### 💬 Say what you need to the browser

Now you are ready to use PlayWord. See the example below.

```typescript
import { chromium } from 'playwright'
import PlayWord from '@playword/core'

const browser = await chromium.launch()
const page = await browser.newPage()

const playword = new PlayWord(page)

await playword.say('Navigate to https://www.google.com')

await playword.say('Input "Hello, World" in the search field')

await playword.say('Press Enter')
// Output: I pressed Enter, and the search results for "Hello, World" are now displayed.
```

No need to worry about how to locate elements or how to interact with them. PlayWord will handle everything for you.

### 🧪 assertion

Calling the method with sentences that start with specific keywords will be treated as assertions.

```typescript
import { test, expect } from '@playwright/test'
import PlayWord from '@playword/core'

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

- are
- assert
- assure
- can
- check
- compare
- confirm
- could
- did
- do
- does
- ensure
- expect
- guarantee
- has
- have
- is
- match
- satisfy
- shall
- should
- test
- then
- was
- were
- validate
- verify

### 🔴 Recordings

PlayWord supports recording the executions and replaying them later.

```typescript
// Save the recordings in the default path (.playword/recordings.json)
const playword = new PlayWord(page, { record: true })

// Specify the path to save the recordings (Should end with .json)
const playword = new PlayWord(page, { record: 'path/to/recordings.json' })
```

As the recordings are generated, PlayWord will prioritize using them to execute the tests without consuming API tokens.

### 🔄 Retry on failure

Sometimes, errors may occur due to UI changes or unexpected behaviors. In such cases, using `retryOnFailure` will allow PlayWord to retry the failed action using AI.

```typescript
const playword = new PlayWord(page, { record: true, retryOnFailure: true })
```

You can also disable recordings for specific steps by setting `withoutRecordings` to **true**.

```typescript
await playword.say('Navigate to https://www.google.com')

await playword.say('Input "Hello, World" in the search field', { withoutRecordings: true })

await playword.say('Press Enter')
```

### 📸 Screenshot reference

Screenshot reference helps AI understand the page state and better meet your needs. However, it will increase the cost of the OpenAI API and take longer to process.

To enable screenshot reference, set `useScreenshot` to **true**.

```typescript
const playword = new PlayWord(page, { useScreenshot: true })
```

### 🖼️ Handle frames

If you need to interact with elements inside frames, just tell PlayWord which frame you want to switch to.

```typescript
await playword.say('Go to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe')

await playword.say('Switch to the frame contains the street map')

await playword.say('Click the "zoom-in" button')

await playword.say('Click the "zoom-out" button')

await playword.say('Go back to the main page')
```

### 🔧 Debug mode

Enable debug mode by setting `debug` to **true**. This will print the AI's responses during execution.

```typescript
const playword = new PlayWord(page, { debug: true })
```

### 🚀 Perform multiple actions in one sentence

If your input contains multiple actions, they will be executed in parallel.

**NOTE**: Since it is not possible to determine which step will be finished first, only use multiple actions under the premise that the order of execution does not matter.

```typescript
await playword.say('Navigate to https://github.com/')

await playword.say('Click the "Sign in" link')

await playword.say('Input "{EMAIL}" in the email field and "{PASSWORD}" in the password field')

await playword.say('Click the "Sign in" button')
```

## 🤔 So why PlayWord?

| Aspect         | Traditional Testing                                   | PlayWord                                 |
| -------------- | ----------------------------------------------------- | ---------------------------------------- |
| Dev Experience | Locating elements is very frustrating                 | Say goodbye to locating elements.        |
| Dev Speed      | Time is needed for both test cases and test code      | Remove the time spent writing test code  |
| Maintainance   | High maintenance cost due to UI changes               | AI-powered adaption to UI changes        |
| Readability    | Test code and output aren't always easy to understand | Test cases are readable and executable   |

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
