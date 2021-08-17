import { ROLLMATCH } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class MoreHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['more']

  public helpText = () => this.i18n(this.messagesText.helpText.more)

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.getNameAndIds(msg) as ROLLMATCH

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll === undefined) {
      this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        this.i18n(this.messagesText.notInitializedARoll),
      )
      return
    }

    if (foundUserRoll.global) {
      responseMessage.global = true
    }
    
    foundUserRoll.nextType()

    responseMessage.more = foundUserRoll.type
    this.ws.sendMessage(MessageType.ROLLMATCH, JSON.stringify(responseMessage))
  }

  // public async onServerResponse (res) {}
}
