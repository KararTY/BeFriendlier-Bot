import { MessageType, ROLLMATCH } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import messagesText from '../messagesText'
import DefaultHandler from './DefaultHandler'

export default class MoreHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['more']

  public helpText = () => messagesText.helpText.more

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.getNameAndIds(msg) as ROLLMATCH

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll === undefined) {
      this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        messagesText.notInitializedARoll,
      )
      return
    }

    foundUserRoll.nextType()

    if (foundUserRoll.global) {
      responseMessage.global = true
    }

    responseMessage.more = foundUserRoll.type
    this.ws.sendMessage(MessageType.ROLLMATCH, JSON.stringify(responseMessage))
  }

  // public async onServerResponse (res) {}
}
