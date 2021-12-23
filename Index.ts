// Load env variables
import { Logger } from '@adonisjs/logger'
import { PajbotAPI, TwitchAuth } from 'befriendlier-shared'
import PajbotConfig from './config/Pajbot'
import { readdirSync } from 'fs'
import path from 'path'
import TwitchConfig from './config/Twitch'
import WSConfig from './config/Ws'
import packageJSON from './package.json'
import Twitch from './src/Twitch'
import Ws from './src/Ws'

import env from './env'

const logger = new Logger({
  name: 'befriendlier-bot',
  enabled: true,
  level: typeof env.get('LOG_LEVEL') === 'string' ? String(env.get('LOG_LEVEL')) : 'info',
  prettyPrint: env.get('NODE_ENV') === 'development',
})

// Initialize config values for WS.
const wsConfig = new WSConfig(env)
const server = new Ws(wsConfig, logger)

// Initialize config values for Twitch.
const apiConfig = new TwitchConfig(env)
const api = new TwitchAuth(apiConfig, logger.level)

// Initialize Pajbot.
const pajAPIConfig = new PajbotConfig()
const pajbotAPI = new PajbotAPI(pajAPIConfig, logger.level)

// Start Twitch client.
const twitch = new Twitch(apiConfig, server, api, pajbotAPI, packageJSON, logger)

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
