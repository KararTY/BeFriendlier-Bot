import { MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class NoHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['no', 'mismatch']

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.makeResponseMesage(msg)

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll === undefined) {
      return
    }

    if (foundUserRoll.global) {
      responseMessage.global = true
    }

    this.ws.sendMessage(MessageType.MISMATCH, JSON.stringify(responseMessage))
  }

  // public async onServerResponse (res) {}
}
