import { Env } from '@adonisjs/env'

export default class WSConfig {
  public url: string
  public headers: { 'user-agent': string }

  constructor (env: Env) {
    /**
     * Server url to connect to.
     */
    this.url = `ws://${env.get('HOST') as string}:${env.get('PORT') as string}`

    /**
     * HTTP request headers.
     */
    this.headers = {
      'user-agent': `BEFRIENDLIER-BOT-${process.platform}-${process.pid}`
    }
  }
}
