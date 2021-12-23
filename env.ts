/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
*/

import { readFileSync } from 'fs'
import path from 'path'

import { Env, EnvParser } from '@adonisjs/env'

const env = new Env([
  {
    values: new EnvParser(true).parse(readFileSync(path.join(__dirname, '.env'), 'utf-8')),
    overwriteExisting: true
  }
])

env.rules({
  PORT: env.schema.number(),
  HOST: env.schema.string(),

  NODE_ENV: env.schema.enum(['production', 'development', 'testing'] as const),
  LOG_LEVEL: env.schema.enum(['info', 'debug', 'warning', 'error'] as const),

  COMMAND_PREFIX: env.schema.string(),

  TWITCH_CLIENT_TOKEN: env.schema.string(),
  TWITCH_CLIENT_SECRET: env.schema.string(),
  TWITCH_BOT_NAME: env.schema.string(),
  TWITCH_BOT_ID: env.schema.string(),

  ADMINS: env.schema.string(),
})

env.process()

export default env
