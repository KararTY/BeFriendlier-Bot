import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class NoHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['no', 'mismatch']

  public helpText = (): string => this.i18n(this.messagesText.helpText.no)

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

    this.ws.sendMessage(MessageType.MISMATCH, JSON.stringify(responseMessage))
  }

  // public async onServerResponse (res) {}
}
