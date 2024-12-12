#!/usr/bin/env node
import process from 'node:process'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import TestCommand from './testCommand'
;(() =>
  yargs(hideBin(process.argv))
    .scriptName('@playword/cli')
    .usage('$0 <command> [options]')
    .command(TestCommand)
    .version(false)
    .wrap(null)
    .help()
    .showHelpOnFail()
    .demandCommand().argv)()
