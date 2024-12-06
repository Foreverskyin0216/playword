import spinner from 'ora'

/**
 * Print a divider line.
 */
export const divider = () => {
  console.log('-'.repeat(process.stdout.columns))
}

/**
 * Print an information message.
 *
 * @param message The message to print.
 */
export const info = (message: unknown, color: 'green' | 'magenta' = 'green') => {
  console.log(`\x1b[${color === 'magenta' ? 35 : 32}m${message}\x1b[0m`)
}

/**
 * Start a progress spinner.
 *
 * @param text The text to print.
 */
export const startLog = (text: string) => spinner({ text }).start()
