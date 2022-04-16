import { Env } from '@adonisjs/env'

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
    this.clientToken = env.get('TWITCH_CLIENT_TOKEN')

    /**
     * Twitch client secret token.
     */
    this.clientSecret = env.get('TWITCH_CLIENT_SECRET')

    /**
     * Redirect URI.
     */
    this.redirectURI = ''

    /**
     * Twitch username.
     */
    this.user = {
      name: env.get('TWITCH_BOT_NAME') as string,
      id: env.get('TWITCH_BOT_ID') as string
    }

    /**
     * Scopes to ask for.
     */
    this.scope = []

    /**
     * HTTP request headers.
     */
    this.headers = {
      'user-agent': 'befriendlierbot (https://github.com/kararty/befriendlier-bot)'
    }

    /**
     * Command prefix.
     */
    this.commandPrefix = env.get('COMMAND_PREFIX') as string

    /**
     * Admins with access to super commands.
     */
    this.admins = env.get('ADMINS')?.toString().split(',')
  }
}
