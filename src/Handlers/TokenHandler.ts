import { MessageType, Token } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class TokenHandler extends DefaultHandler {
  public messageType = MessageType.TOKEN

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse (res: Token): Promise<void> {
    this.twitch.token = res

    // Login / Relogin to Twitch
    return await this.twitch.loginToTwitch().then(async () => {
      if (this.twitch.channels.size > 0) {
        // Rejoin channels
        const channelNames: string[] = []
        for (const [, channel] of this.twitch.channels) {
          channelNames.push(channel.name)
        }

        await this.twitch.ircClient.joinAll(channelNames).then(() => {
          this.logger.info(`TokenHandler.onServerResponse() -> Twitch.JOINALL: Joined ${channelNames.join(', ')}.`)
        }).catch((error) => {
          this.logger.error({ err: error }, 'TokenHandler.onServerResponse() -> Twitch.JOINALL')
        })
      }
    })
  }
}
