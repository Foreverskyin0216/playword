# @playword/cli

[![NPM Version](https://img.shields.io/npm/v/@playword/cli)](https://www.npmjs.com/package/@playword/cli)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-yellow)](https://nodejs.org/en/download/package-manager)
[![CI](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml/badge.svg)](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Foreverskyin0216/playword/graph/badge.svg?token=8VO1EFXKDI)](https://codecov.io/gh/Foreverskyin0216/playword)

Use PlayWord instantly from the command line.

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

### Options

| Property           | Alias | Type           | Default    | Description                                                                                                        |
| ------------------ | ----- | -------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `--headed`         | `-h`  | bool           | **false**  | Whether to open the browser in headed mode.                                                                        |
| `--env-file`       | `-e`  | string         | **.env**   | Which env file to use.                                                                                             |
| `--record`         | `-r`  | bool, string   | **false**  | Whether to record the test steps.<br>You can also specify a file path to save the recording. (Must be a JSON file) |
| `--playback`       | `-p`  | string         | **false**  | Whether to playback the test steps from a recording file.<br>This should be used with the `--record` option.       |
| `--use-screenshot` | `-s`  | bool           | **false**  | Whether to enable screenshot reference.                                                                            |
| `--browser`        | `-b`  | string         | **chrome** | Which browser to use. Supported values are `chromium`, `chrome`, `msedge`, `firefox` and `webkit`.                 |
| `--verbose`        | `-v`  | bool           | **false**  | Whether to enable verbose mode.                                                                                    |
| `--openai-options` | `-o`  | array          | **[]**     | Additional OpenAI API options. e.g.<br>`--openai-option apiKey=sk-... baseURL=https://...`                         |
| `--help`           |       | bool           | **false**  | Show help information.                                                                                             |
