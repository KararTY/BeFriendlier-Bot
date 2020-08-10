// Load env variables
import { env } from '@adonisjs/env/build/standalone'
import { Logger } from '@adonisjs/logger/build/standalone'
import { TwitchAuth } from 'befriendlier-shared'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import TwitchConfig from './config/Twitch'
import WSConfig from './config/Ws'
import packageJSON from './package.json'
import Twitch from './src/Twitch'
import Ws from './src/Ws'

env.process(readFileSync(path.join(__dirname, '.env'), 'utf-8'))

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

// Start Twitch client.
const twitch = new Twitch(apiConfig, server, api, packageJSON, logger)

// Add command handlers
const commandDirectory = path.join(__dirname, 'src', 'Handlers')
const commandFiles = readdirSync(commandDirectory, 'utf-8')

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
