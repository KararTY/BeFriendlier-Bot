import { MessageType, ROLLMATCH } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class MoreHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['more']

  public helpText = () => 'returns more information about the rolled profile.'

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.makeResponseMesage(msg) as ROLLMATCH

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll === undefined) {
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
