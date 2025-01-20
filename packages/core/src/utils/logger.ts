/**
 * Print a divider line.
 */
export const divider = () => {
  if (process.env.PLWD_DEBUG !== 'true') return
  console.log('-'.repeat(process.stdout.columns))
}

/**
 * Print an information message.
 *
 * @param message The message to print.
 * @param color The color of the message.
 */
export const info = (message: string, color: 'green' | 'magenta' | 'red' | 'none' = 'none') => {
  if (process.env.PLWD_DEBUG !== 'true') return

  const colorMap = { green: 32, magenta: 35, red: 31 }

  if (color === 'none') {
    return console.log(message)
  }

  return console.log(`\x1b[${colorMap[color]}m${message}\x1b[0m`)
}
