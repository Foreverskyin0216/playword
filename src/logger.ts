/**
 * Print a divider line.
 */
export const divider = () => {
  console.log('-'.repeat(process.stdout.columns))
}

/**
 * Print an info log.
 *
 * @param message The message to print.
 */
export const info = (message: unknown) => {
  console.log('\x1b[35m [INFO] \x1b[0m', '\x1b[32m ' + message + ' \x1b[0m')
}
