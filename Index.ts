// Load env variables
import { env } from '@adonisjs/env/build/standalone'
import { readFileSync } from 'fs'
import path from 'path'
import Ws from './src/Ws'

env.process(readFileSync(path.join(__dirname, '.env'), 'utf-8'))

// Start Ws client.
;(() => new Ws(
  `ws://${env.getOrFail('HOST') as string}:${env.getOrFail('PORT') as string}`,
  {
    'user-agent': `BEFRIENDLIER-BOT-${Date.now()}`,
  },
))()
