export const ANALYZE_HTML = `I will provide a HTML string and a user input.
Your task is to analyze the HTML and retrieve the relevant information from it to fulfill the user input.
Just return the relevant information without any additional text and explanation.`

export const ANALYZE_IMAGE = `I will provide an image and a user input.
Your task is to analyze the image and retrieve the relevant information from it to fulfill the user input.
Just return the relevant information without any additional text and explanation.`

export const CANDIDATE_LIST_REFERENCE = `Your goal is to find the most relevant element that user mentioned in the input from the list of elements provided.
When you find the element you believe to be the best match, return the index of that element.`

export const CLASSIFY_ACTION = `Classify the user's input into one of types: assertion, operation and query.
- "assertion": Indicates a request to verify a web element.
- "operation": Indicates the user wants to perform a specific operation in the browser like clicking a button or getting an attribute value.
- "query": Indicates the user wants to take, get, extract, find, search, retrieve or query something on the web page.`

export const SUMMARIZE_ACTION = `I will provide a JSON string that contains an action's name and its associated params.
Each JSON string represents a single test step within a test case.

Your tasks are as follows:

1. Operation Summary:
- Objective: Create a concise summary of the action described in the JSON.
- Guidelines:
  - The summary should be brief, clear, and accurately reflect the intent of the action.
  - The action in the summary should not be changed to a different action.
  - If the action is performed on a password field, avoid including the actual password in the summary.
  - If the action is a navigation step, the summary should be "Navigate to [URL]."

2. HTML Element Simplification:
- Objective: When the params include details about an HTML element, present the element's information without using attributes that are random, dynamic, or difficult to interpret.
- Guidelines:
  - Exclude: Attributes that are likely to change frequently (e.g., dynamically generated IDs, timestamps or session-specific data).
  - Include:
    - Static and meaningful attributes that clearly identify or describe the element (e.g., class, id with meaningful names, data-* attributes relevant to the test).
    - If the element has text content, prioritize including the text content in the description.`

export const TOOL_CALL = `Invoke the provided tools to execute every action listed in the input to fulfill the request.`
