import { Env } from '@adonisjs/env/build/src/Env'

export default class TwitchConfig {
  public clientToken: string
  public clientSecret: string
  public redirectURI: string
  public user: { name: string, id: string }
  public scope: string[]
  public headers: { 'user-agent': string }
  public commandPrefix: string
  public admins: string[] | undefined

  constructor (env: Env) {
    /**
     * Twitch client ID token.
     */
    this.clientToken = env.getOrFail('TWITCH_CLIENT_TOKEN') as string

    /**
     * Twitch client secret token.
     */
    this.clientSecret = env.getOrFail('TWITCH_CLIENT_SECRET') as string

    /**
     * Redirect URI.
     */
    this.redirectURI = ''

    /**
     * Twitch username.
     */
    this.user = {
      name: env.getOrFail('TWITCH_BOT_NAME') as string,
      id: env.getOrFail('TWITCH_BOT_ID') as string,
    }

    /**
     * Scopes to ask for.
     */
    this.scope = []

    /**
     * HTTP request headers.
     */
    this.headers = {
      'user-agent': 'befriendlierbot (https://github.com/kararty/befriendlier-bot)',
    }

    /**
     * Command prefix.
     */
    this.commandPrefix = env.getOrFail('COMMAND_PREFIX') as string

    /**
     * Admins with access to super commands.
     */
    this.admins = env.get('ADMINS')?.toString().split(',')
  }
}
