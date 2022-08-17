import { Logger } from '@adonisjs/logger'
import env from './env'

const logger = new Logger({
  name: 'befriendlier-bot',
  enabled: true,
  level: typeof env.get('LOG_LEVEL') === 'string' ? String(env.get('LOG_LEVEL')) : 'info',
  prettyPrint: env.get('NODE_ENV') === 'development'
})

export default logger
