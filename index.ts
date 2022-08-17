// Load env variables
import env from './env'
import logger from './logger'

import { TwitchAuth } from 'befriendlier-shared'
import { readdirSync } from 'fs'
import path from 'path'
import TwitchConfig from './config/Twitch'
import WSConfig from './config/Ws'
import packageJSON from './package.json'
import Twitch from './src/Twitch'
import Ws from './src/Ws'

// Initialize config values for WS.
const wsConfig = new WSConfig(env)
const server = new Ws(wsConfig, logger)

// Initialize config values for Twitch.
const apiConfig = new TwitchConfig(env)
const api = new TwitchAuth(apiConfig, logger.level)

// Start Twitch client.
const twitch = new Twitch(apiConfig, server, api, packageJSON, logger)

// Add command handlers
const commandDirectory = path.join(__dirname, 'src', 'Handlers')
const commandFiles = readdirSync(commandDirectory, 'utf-8').filter(fileName => fileName.endsWith('.js'))

// eslint-disable-next-line no-void
void (async function loadHandlers (): Promise<void> {
  let currentFileDir: string = ''

  try {
    for (let index = 0; index < commandFiles.length; index++) {
      currentFileDir = commandFiles[index]
      const fullFileName = path.join(commandDirectory.toString(), commandFiles[index])

      // Import
      const Command = (await import(fullFileName)).default
      twitch.handlers.push(new Command(twitch, server, logger))
    }

    server.connect()
  } catch (error) {
    logger.error({ err: error }, `Index.ts: Something went wrong while importing ${String(currentFileDir)}.`)
    setTimeout(() => {
      process.exit(0)
    }, 10000)
  }
})()
