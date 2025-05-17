# @playword/cli

[![NPM Version](https://img.shields.io/npm/v/@playword/cli?color=blue&logo=npm)](https://www.npmjs.com/package/@playword/cli)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-yellow?logo=javascript)](https://nodejs.org/en/download/package-manager)
[![CI](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml/badge.svg)](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Foreverskyin0216/playword/graph/badge.svg)](https://codecov.io/gh/Foreverskyin0216/playword)

Use the PlayWord's features instantly from the command line.

## 📦 Installation

```bash
# Install with any package manager you prefer
npm install @playword/cli --save-dev

# Run the package directly with npx (recommended)
npx @playword/cli test --headed --verbose
```

## 📖 Available Commands

### `test`

Run a PlayWord test step by step.

```bash
npx @playword/cli test [options]
```

#### Test Options

| Property       | Alias | Type           | Default    | Description                                                                                                    |
| -------------- | ----- | -------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `--headed`     | `-h`  | bool           | **false**  | Whether to open the browser in headed mode.                                                                    |
| `--delay`      | `-d`  | number         | **250**    | Delay between each test step in milliseconds.                                                                  |
| `--env-file`   | `-e`  | string         | **.env**   | Which env file to use.                                                                                         |
| `--record`     | `-r`  | string \| bool | **false**  | Whether to record the test steps.<br>You can also specify a file path to save the recording. (Must be `.json`) |
| `--playback`   | `-p`  | string         | **false**  | Whether to playback the test steps from a recording file.<br>This should be used with the `--record` option.   |
| `--browser`    | `-b`  | string         | **chrome** | Which browser to use. Available browsers: `chrome`, `chromium`, `firefox`, `msedge`, and `webkit`.             |
| `--verbose`    | `-v`  | bool           | **false**  | Whether to enable verbose mode.                                                                                |
| `--ai-options` | `-o`  | list           | **[]**     | Additional AI options. e.g.<br>`--ai-options openAIApiKey=sk-... baseURL=https://...`.                         |
| `--help`       |       | bool           | **false**  | Show help information.                                                                                         |

### `observe`

Start the Observer to record and dry-run test steps.

```bash
npx @playword/cli observe [options]
```

#### Observe Options

| Property        | Alias | Type   | Default                       | Description                                                                                                      |
| --------------- | ----- | ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--delay`       | `-d`  | number | **250**                       | Delay between each test step in milliseconds during the dry-run process.                                         |
| `--env-file`    | `-e`  | string | **.env**                      | Which env file to use.                                                                                           |
| `--record-path` | `-r`  | string | **.playword/recordings.json** | Where to save the recordings. (Must be `.json`)                                                                  |
| `--browser`     | `-b`  | string | **chrome**                    | Which browser to use. Available browsers: `chrome`, `chromium`, `firefox`, `msedge`, and `webkit`.               |
| `--verbose`     | `-v`  | bool   | **false**                     | Whether to enable verbose mode.                                                                                  |
| `--ai-options`  | `-o`  | list   | **[]**                        | Additional AI options. e.g.<br>`-o anthropicApiKey=sk-... voyageAIApiKey=pa-... model=claude-3-7-sonnet-latest`. |
| `--help`        |       | bool   | **false**                     | Show help information.                                                                                           |
