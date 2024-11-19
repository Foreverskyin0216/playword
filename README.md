# PlayWord

[![NPM Version](https://img.shields.io/npm/v/playword)](https://www.npmjs.com/package/playword)
[![Release Notes](https://img.shields.io/github/release/Foreverskyin0216/playword)](https://github.com/Foreverskyin0216/playword/releases)
[![CI](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml/badge.svg)](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml)
[![GitHub License](https://img.shields.io/github/license/Foreverskyin0216/playword)](https://opensource.org/licenses/MIT)

Convert your intentions into Playwright actions using AI!

## 📦 Installation

Install `playword` package using any package manager you prefer.

```llvm
npm  add playword
yarn add playword
pnpm add playword
```

## 🚀 Usage

Using PlayWord is very simple!

First, this package requires calling OpenAI API. You need to export your API key as an environment. You can see more details on how to get the API key [here](https://platform.openai.com/api-keys).

```bash
export OPENAI_API_KEY="sk-..."
```

### 💬 Talk with Browser

After setting up the API key, import this package and use it as shown below.

```javascript
import { chromium } from 'playwright'
import { PlayWord } from 'playword'

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  const playword = new PlayWord(page)

  await playword.say('Navigate to https://www.google.com')

  await playword.say('Input "Hello, World" in the search field')

  await playword.say('Press Enter')
})()
```

No need to worry about how to locate elements or how to interact with them. PlayWord will take care of that for you!

### Multiple actions in one sentence

When you include multiple actions in one sentence, PlayWord will execute them in parallel.

**NOTE**: Since it is not possible to determine which step will be executed first, please use multiple actions only under the premise that the order of execution does not matter.

```javascript
await playword.say('Navigate to https://www.google.com')

await playword.say('Input "Hello" in the search field and then input "World" in the search field')

await playword.say('Press Enter')
```

### 🧪 Assertion

PlayWord supports assertions as well!

Calling the `say()` method witn sentences that start with specific keywords will be treated as assertions.

```javascript
import { test, expect } from '@playwright/test'
import { PlayWord } from 'playword'

test('An example of using PlayWord in a Playwright test', async ({ page }) => {
  const playword = new PlayWord(page)

  await playword.say('Navigate to https://www.google.com')

  await playword.say('Input "Hello, World" in the search field')

  await playword.say('Press Enter')

  const result = await playword.say('Check if the page contains "HELLO WORLD"')
  expect(result).toBe(true)
})
```

### Assertion keywords

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

```javascript
const playword = new PlayWord(page, { record: true })
// save recordings in .playword/recordings.json
```

You can set a custom path as well. (**Should end with .json**)

```javascript
const playword = new PlayWord(page, { record: 'path/to/recordings.json' })
// save recordings in path/to/recordings.json
```

When the recording is complete and the test is run again in record mode, PlayWord will use the execution records from the recording for sentences that have the same **content** and **order**. If there are changes in order or content, it will switch back to using AI execution.

### Disable record mode for a specific step

If you don't want to use the recording in some steps, you can disable it by setting the `withoutRecordings` option to **true**.

```javascript
await playword.say('Navigate to https://www.google.com', { withoutRecordings: true })
```

## Supported actions in PlayWord

Currently, PlayWord supports the following actions:

### Browser actions

- Click on an element
- Hover over an element
- Input text in an element
- Navigate to a URL
- Press keys
- Scroll on the page
- Select an option
- Wait for a specific text to appear

### Assertion

- Assert the content of an element is equal to a specific text
- Assert the element is visible
- Assert the element is not visible
- Assert the page contains a specific text
- Assert the page does not contain a specific text
- Assert the page title is equal to a specific text
- Assert the URL matches a specific format (regexp)

### More actions will be supported in the future!

## 🎉 Hope you enjoy using PlayWord!
