import { MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import messagesText from 'src/messagesText'
import DefaultHandler from './DefaultHandler'

export default class NoHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['no', 'mismatch']

  public helpText = () => messagesText.helpText.no

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.getNameAndIds(msg)

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll === undefined) {
      this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        messagesText.notInitializedARoll,
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
