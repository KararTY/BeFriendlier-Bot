import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class PingHandler extends DefaultHandler {
  public messageType = MessageType.PING

  public prefix = ['ping']

  public helpText = (): string => this.i18n(this.messagesText.helpText.ping)

  public async onCommand (msg: PrivmsgMessage): Promise<void> {
    const responseMessage = this.getNameAndIds(msg)

    const dateNow = Date.now()
    await this.twitch.ircClient.ping()
    const dateAfterPing = Date.now()
    responseMessage.result = { pingFromBotToTwitch: dateAfterPing - dateNow }
    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse (data: BASE | undefined, res: { timestamp: number }): Promise<void> {
    if (data !== undefined) {
      const websitePingDiff = Date.now() - res.timestamp
      void this.twitch.sendMessage(
        data.channelTwitch,
        data.userTwitch,
        `ping from Bot to Twitch: ~${String(data.result.pingFromBotToTwitch)} ms. ` +
        (websitePingDiff > 10 ? `Ping from Bot to Website: ~${String(Date.now() - res.timestamp)} ms.` : '')
      )
    } else {
      // TODO: Looks like this is a healthcheck!
    }
  }
}
