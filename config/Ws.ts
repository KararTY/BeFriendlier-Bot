import { Env } from '@adonisjs/env/build/src/Env'

export default class WSConfig {
  public url: string
  public headers: { 'user-agent': string }

  constructor (env: Env) {
    /**
     * Server url to connect to.
     */
    this.url = `ws://${env.getOrFail('HOST') as string}:${env.getOrFail('PORT') as string}`

    /**
     * HTTP request headers.
     */
    this.headers = {
      'user-agent': `BEFRIENDLIER-BOT-${process.platform}-${process.pid}`,
    }
  }
}
