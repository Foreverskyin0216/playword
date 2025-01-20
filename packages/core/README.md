# PlayWord

[![NPM Version](https://img.shields.io/npm/v/@playword/core)](https://www.npmjs.com/package/@playword/core)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-yellow)](https://nodejs.org/en/download/package-manager)
[![CI](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml/badge.svg)](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Foreverskyin0216/playword/graph/badge.svg?token=8VO1EFXKDI)](https://codecov.io/gh/Foreverskyin0216/playword)

Supercharge your web test automation experience with AI.

![PlayWord](https://i.ibb.co/p0jdhQC/demo.gif)

## 📦 Installation

Choose the package that best suits your needs.

### @playword/core

The `@playword/core` package provides the core features of PlayWord and can be used as **Node.js** modules.

It includes the following modules:

- **PlayWord**: Enables browser operations and validations using natural language inputs to interact with web pages.
- **Observer**: Mounts a monitoring interface on the browser to record and dry-run captured test steps.

```bash
# Install with any package manager you prefer
npm install @playword/core --save-dev
```

### @playword/cli

The `@playword/cli` package enables you to use the features of PlayWord directly through the command line.

For ease of use, I recommend running this package with `npx`.

```bash
# Run a PlayWord test
npx @playword/cli test --headed --verbose -b webkit

# Start the Observer
npx @playword/cli observe -b chromium -v
```

See [documentation](https://github.com/Foreverskyin0216/playword/tree/main/packages/cli) for usage examples and options.

## 📘 Getting Started

PlayWord uses the [OpenAI API](https://platform.openai.com/docs/overview) to understand the user's intent
and perform corresponding actions.

To get started, export your OpenAI API key as an environment variable or pass it directly through `openAIOptions`.

```bash
export OPENAI_API_KEY="sk-..."
```

```typescript
import { chromium } from 'playwright'

const browser = await chromium.launch()
const context = await browser.newContext()

const playword = new PlayWord(context, {
  debug: true,             // Debug mode
  openAIOptions: {
    apiKey: 'sk-...',      // Your OpenAI API Key
    baseURL: 'https://...' // Custom endpoint (if applicable)
    // ...                 // Additional OpenAI API options can also be configured here
  }
})
```

## 💬 Communicate with Browser

In its basic usage, you can use the `say` method to interact with the page.

No need to worry about locating elements or performing interactions—**PlayWord handles all of that for you**.

```typescript
await playword.say('Navigate to https://www.google.com')

await playword.say('Type "Hello, World!" in the search bar')

await playword.say('Press enter')
```

### ✅ Assertion

PlayWord uses keywords to identify whether a step is an assertion.
This approach ensures more stable results compared to relying solely on AI judgment.

```typescript
import { PlayWord } from '@playword/core'
import assert from 'node:assert'
import test from 'node:test'
import { chromium } from 'playwright'

test('Bootstrap Website Test', async function () {
  // Initialize PlayWord
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const playword = new PlayWord(context)

  // Navigate to the website
  await playword.say('Navigate to https://getbootstrap.com')

  // Interact with elements
  await playword.say('Click the search field')
  await playword.say('Input "Quick Start" in the search bar')
  await playword.say('Press enter')

  // Perform an assertion
  const result = await playword.say('Is "<h1>Hello, world!</h1>" on the page?')
  assert(result)

  await browser.close()
})
```

The input starting with any of the following **case-insensitive** keywords will be recognized as an assertion:

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

Hardcoding sensitive information in your test cases is not a good practice.
Instead, use custom variables with the syntax `{VARIABLE_NAME}` and define them in your environment settings.

```typescript
// In your .env file
// USERNAME=standard_user
// PASSWORD=secret_sauce

import 'dotenv/config'

await playword.say('Navigate to https://www.saucedemo.com')

// {USERNAME} and {PASSWORD} are replaced with the values from the environment
await playword.say('Input {USERNAME} in the username field')
await playword.say('Input {PASSWORD} in the password field')

await playword.say('Log in')
```

## 🔴 Recordings

PlayWord supports recording test executions and replaying them later for efficient and consistent testing.

```typescript
// Save recordings to the default path (.playword/recordings.json)
const playword = new PlayWord(context, { record: true })

// Save recordings to a custom path (must end with .json)
const playword = new PlayWord(context, { record: 'path/to/recordings.json' })
```

If recordings are available, PlayWord prioritizes using them to execute tests, reducing the need to consume API tokens.

If a recorded action fails, PlayWord automatically retries it using AI.

### ✨ Using AI during Playback

To ensure PlayWord uses AI for specific steps during playback, start the input with `[AI]`.

```typescript
await playword.say('[AI] click the "Login" button')

await playword.say('[AI] verify the URL matches "https://www.saucedemo.com/inventory.html"')
```

## 👁️‍🗨️ Observer

The Observer module enables tracking and recording user interactions on web pages.
By leveraging AI, the Observer converts user behaviors into precise and reliable
test cases, making it an essential tool for automated testing of web applications.

![Observer](https://i.ibb.co/PrPDrNJ/observer.png)

To start using the Observer, you need to first create a PlayWord instance in **headed** mode
and pass it as a parameter to the Observer.

```typescript
import { chromium } from 'playwright'
import { Observer, PlayWord } from '@playword/core'

const browser = await chromium.launch()
const context = await browser.newContext()

const playword = new PlayWord(context)
const observer = new Observer(playword, {
  delay: 500, // Delay between each step in milliseconds during the dry-run process
  recordPath: 'path/to/recordings.json' // Path to save recordings
})

// Start the Observer
await observer.observe()
await context.newPage()
```

After starting the Observer, the Observer UI automatically mounts each time a new page is opened.
When you interact with web elements, the AI determines the element you intend to operate on
and generates the corresponding action description.
If you modify the step descriptions, the AI will interpret your intent and record the correct actions

Currently, the Observer UI supports the following actions:
- **Accept events**: Add test steps to the recording.
- **Drop events**: Skip test steps without adding them to the recording.
- **Preview**: View the test steps recorded so far.
- **Clear All**: Delete all recorded test steps.
- **Dry Run**: Trial-run the recorded test steps.

## 🌟 Why use PlayWord?

| Aspect         | Traditional Testing                                 | PlayWord                                                     |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| Dev Experience | Locating elements is very frustrating               | AI takes care of locating elements. Say goodbye to selectors |
| Efficiency     | Time is needed for writing both test cases and code | Test cases serve both as documentation and executable tests  |
| Maintainance   | High maintenance cost due to UI changes             | AI-powered adaption to UI changes                            |
| Learning Curve | Requires knowledge of testing frameworks and tools  | Just use natural language to execute tests                   |

## 📜 Supported Actions in PlayWord and PlayWord Observer

### Page Actions

- Click on an element
- Get text of an element
- Go to a specific URL
- Hover over an element
- Press a key or keys
- Scroll in a specific direction (top, bottom, up, down)
- Select an option from a select element
- Sleep for a specific duration in milliseconds
- Switch to a specific frame
- Switch to other pages
- Type text into an input field or textarea
- Wait for text to appear on the page

### Assertion

- Check if an element contains specific text
- Check if an element does not contain specific text
- Check if an element content is equal to specific text
- Check if an element content is not equal to specific text
- Check if an element is visible
- Check if an element is not visible
- Check if the page contains specific text
- Check if the page does not contain specific text
- Check if the page title is equal to specific text
- Check if the page URL matches specific RegExp patterns

**Note**:
Some page actions and assertions cannot be directly recorded through the Observer UI.
In such cases, by manually editing the step descriptions,
the AI will interpret your intent and record the correct actions.

### More actions will be supported in future releases 🚀

## Finally, Have Fun with PlayWord! 🎉
