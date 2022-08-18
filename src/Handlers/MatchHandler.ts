import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class MatchHandler extends DefaultHandler {
  public messageType = MessageType.MATCH

  public prefix = ['match', 'yes']

  public helpText = (): string => this.i18n(this.messagesText.helpText.match)

  public async onCommand (msg: PrivmsgMessage): Promise<void> {
    const responseMessage = this.getNameAndIds(msg)

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll === undefined) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        this.i18n(this.messagesText.notInitializedARoll),
        responseMessage.messageID
      )
      return
    }

    if (foundUserRoll.global) {
      responseMessage.global = true
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: BASE): Promise<void> {
    void this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value), messageID)

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
