# PlayWord

[![NPM Version](https://img.shields.io/npm/v/@playword/core)](https://www.npmjs.com/package/@playword/core)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-yellow)](https://nodejs.org/en/download/package-manager)
[![CI](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml/badge.svg)](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Foreverskyin0216/playword/graph/badge.svg?token=8VO1EFXKDI)](https://codecov.io/gh/Foreverskyin0216/playword)

Automate browsers with AI: What you say is what you get.

![PlayWord](https://i.ibb.co/JtfJvXH/demo1.gif)

## 📦 Installation

Choose the package that best suits your needs.

### @playword/core

The `@playword/core` package provides the core functionality of PlayWord and can be used as a **Node.js** module.

```bash
# Install with any package manager you prefer
npm install @playword/core --save-dev
```

### @playword/cli

The `@playword/cli` package enables you to use PlayWord directly from the command line.

For ease of use, I recommend running this package with `npx`.

```bash
# Run a PlayWord test
npx @playword/cli test --headed --verbose -b webkit
```

See [documentation](https://github.com/Foreverskyin0216/playword/tree/main/packages/cli) for usage examples and options.

## 📘 Getting Started

PlayWord uses the [OpenAI API](https://platform.openai.com/docs/overview) to understand the user's intent and perform corresponding actions.

To get started, export your OpenAI API key as an environment variable or pass it directly through `openAIOptions`.

```bash
export OPENAI_API_KEY="sk-..."
```

```typescript
const playword = new PlayWord(page, {
  debug: true,             // Debug mode
  openAIOptions: {
    apiKey: 'sk-...',      // Your OpenAI API Key
    baseURL: 'https://...' // Custom endpoint (if applicable)
    // ...                 // Additional OpenAI API options can be configured here
  }
})
```

## 💬 Communicate with Browser

In its basic usage, you can initialize PlayWord with a Playwright page and use the `say` method to interact with the page.

![PlayWord](https://i.ibb.co/dpGSFgG/demo3.gif)

No need to worry about locating elements or performing interactions——**PlayWord handles all of that for you**.

### ✅ Assertion

PlayWord uses keywords to identify whether a step is an assertion. This approach ensures more stable results compared to relying solely on AI judgment.

```typescript
import PlayWord from '@playword/core'
import assert from 'node:assert'
import test from 'node:test'
import { chromium } from 'playwright'

test('Bootstrap Website Test', async function () {
  // Initialize PlayWord
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const playword = new PlayWord(page)

  // Navigate to the website
  await playword.say('Navigate to https://getbootstrap.com')

  // Interact with elements
  await playword.say('Click the search field')
  await playword.say('Input "Quick Start" in the search bar')
  await playword.say('Press enter')

  // Perform an assertion
  assert(await playword.say('Is "<h1>Hello, world!</h1>" on the page?'))
  await browser.close()
})
```

A sentence starting with any of the following **case-insensitive** keywords will be recognized as an assertion:

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

### 🖼️ Frame Handling

To interact with elements inside frames, simply instruct PlayWord to switch to the desired frame.

```typescript
await playword.say('Go to https://iframetester.com')
await playword.say('Type "https://www.saucedemo.com" in the URL field')
await playword.say('Click the render button')

await playword.say('Switch to the frame with the url "https://www.saucedemo.com"')

// Perform actions inside the frame
// ...

await playword.say('Switch to the main frame')
```

### 🔧 Custom Variables

Hardcoding sensitive information in your test cases is not a good practice. Instead, use custom variables with the syntax `{VARIABLE_NAME}` and define them in your environment settings.

```typescript
// In your .env file
// USERNAME=standard_user
// PASSWORD=secret_sauce

import 'dotenv/config'
// ...

await playword.say('Navigate to https://www.saucedemo.com')

await playword.say('Input {USERNAME} in the username field')
await playword.say('Input {PASSWORD} in the password field')

await playword.say('Log in')
// ...
```

## 🔴 Recordings

PlayWord supports recording test executions and replaying them later for efficient and consistent testing.

```typescript
// Save recordings to the default path (.playword/recordings.json)
const playword = new PlayWord(page, { record: true })

// Save recordings to a custom path (must end with .json)
const playword = new PlayWord(page, { record: 'path/to/recordings.json' })
```

When recordings are available, PlayWord will prioritize using them to execute tests, eliminating the need to consume API tokens.

### 🔄 Retry on Failure

Occasionally, errors may occur due to UI changes or unexpected behaviors.
In such cases, enabling `retryOnFailure` allows PlayWord to retry the failed action using AI, increasing test resilience.

```typescript
const playword = new PlayWord(page, { record: true, retryOnFailure: true })
```

### ✨ Using AI during Playback

To force PlayWord to use AI for specific steps during playback, start the sentence with `[AI]`.

```typescript
await playword.say('[AI] click the "Login" button')

await playword.say('[AI] verify the URL matches "https://www.saucedemo.com/inventory.html"')
```

## 📸 Screenshot Reference

Screenshot reference helps AI understand the page state and better meet your needs.

![PlayWord](https://i.ibb.co/CKSQjNG/demo2.gif)

To enable this feature, set `useScreenshot` to **true**.

```typescript
const playword = new PlayWord(page, { useScreenshot: true })
```

## 🌟 Why use PlayWord?

| Aspect         | Traditional Testing                                 | PlayWord                                                     |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| Dev Experience | Locating elements is very frustrating               | AI takes care of locating elements. Say goodbye to selectors |
| Efficiency     | Time is needed for writing both test cases and code | Test cases serve both as documentation and executable tests  |
| Maintainance   | High maintenance cost due to UI changes             | AI-powered adaption to UI changes                            |
| Learning Curve | Requires knowledge of testing frameworks and tools  | Just use natural language to execute tests                   |

## 📜 Supported Actions in PlayWord

### Page Actions

- Click on an element
- Get a specific attribute from an element
- Get specific information from the screenshot of an element ✨
- Get text of an element
- Go back to the previous page
- Go to a specific URL
- Hover over an element
- Press a key or keys
- Scroll in a specific direction (top, bottom, up, down)
- Select an option from a select element
- Switch to a frame
- Type text into an input field or textarea
- Wait for a certain amount of time
- Wait for text to appear on the page

### Assertion

- Check if an element has specific text
- Check if an element does not have specific text
- Check if an element is visible
- Check if an element is not visible
- Check if the page contains specific text
- Check if the page does not contain specific text
- Check if the page title is equal to specific text
- Check if the page URL matches specific RegExp patterns
- Check if the screenshot of an element contains specific information ✨

**Note**: The actions marked with ✨ are AI-powered even during playback.

### More actions will be supported in future releases 🚀

## Finally, Have Fun with PlayWord! 🎉
