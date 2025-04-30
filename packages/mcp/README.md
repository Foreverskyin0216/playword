# @playword/mcp

[![NPM Version](https://img.shields.io/npm/v/@playword/mcp)](https://www.npmjs.com/package/@playword/mcp)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-yellow)](https://nodejs.org/en/download/package-manager)
[![CI](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml/badge.svg)](https://github.com/Foreverskyin0216/playword/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Foreverskyin0216/playword/graph/badge.svg)](https://codecov.io/gh/Foreverskyin0216/playword)

A Model Context Protocol (MCP) server that provides browser automation capabilities using PlayWord,
offering a more powerful automation experience than vanilla Playwright.
Compared to the ariaSnapshot method, PlayWord leverages embeddings to optimize element processing and delivers higher interaction precision.

### Use Cases
- Executing specific automation tasks on web pages.
- Extracting information from targeted web content.

### Example Configuration

#### NPX

PlayWord leverages APIs from multiple LLM providers to automate browser tasks.
To use this tool, you need to provide an API key for one of the supported LLM provider (**OpenAI**, **Google**, or **Anthropic**) in the `env` field.

```json
{
  "mcpServers": {
    "playword": {
      "command": "npx",
      "args": [
        "@playword/mcp",
        "--headless"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "sk-...",
        "VOYAGEAI_API_KEY": "pa-..."
      }
    }
  }
}
```

### Options

| Property       | Alias | Type   | Default    | Description                                                                                        |
| -------------- | ----- | ------ | ---------- | -------------------------------------------------------------------------------------------------- |
| `--ai-options` | `-o`  | list   | **[]**     | Additional AI options (See below).                                                                 |
| `--browser`    | `-b`  | string | **chrome** | Which browser to use. Available browsers: `chrome`, `chromium`, `firefox`, `msedge`, and `webkit`. |
| `--headless`   | `-h`  | bool   | **false**  | Whether to run the browser in headless mode.                                                       |

#### Example for `--ai-options`

```json
{
  "mcpServers": {
    "playword": {
      "command": "npx",
      "args": [
        "@playword/mcp",
        "--ai-options",
        "openAIApiKey=sk-...",
        "model=gpt-4.1",
        "baseURL=https://..."
      ]
    }
  }
}
```

### Supported Interactions

- **CallPlayWord**
  - Description: Call PlayWord to perform a specific action. Any action available in PlayWord is fully supported.
  - Parameters:
    - `input` (string): The user input.
- **ClosePlayWord**
  - Description: Close the running PlayWord instance.
  - Parameters: None
