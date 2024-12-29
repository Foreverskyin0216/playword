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
 * @param color The color of the message.
 */
export const info = (message: unknown, color: 'green' | 'magenta' | 'red' | 'none' = 'none') => {
  const colorMap = { green: 32, magenta: 35, red: 31 }

  if (color === 'none') console.log(message)
  else console.log(`\x1b[${colorMap[color]}m${message}\x1b[0m`)
}

/**
 * Start a progress spinner.
 *
 * @param text The text to print.
 */
export const startLog = async (text: string) => {
  const { default: spinner } = await import('yocto-spinner')
  return spinner({ text }).start()
}
