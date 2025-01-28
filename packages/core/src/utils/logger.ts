/**
 * Print an information message.
 *
 * @param message The message to print.
 * @param color The color of the message.
 * @param divider Whether to print a divider line before the message.
 */
export const info = (message: string, color: 'green' | 'magenta' | 'red' | 'none' = 'none', divider = false) => {
  if (process.env.PLWD_DEBUG !== 'true') return

  const colorMap = { green: 32, magenta: 35, red: 31 }

  if (divider) {
    console.log('-'.repeat(process.stdout.columns))
  }

  if (color === 'none') {
    return console.log(message)
  }

  return console.log(`\x1b[${colorMap[color]}m${message}\x1b[0m`)
}
