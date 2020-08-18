import { BASE, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import messagesText from '../messagesText'
import DefaultHandler from './DefaultHandler'

export default class MatchHandler extends DefaultHandler {
  public messageType = MessageType.MATCH

  public prefix = ['match', 'yes']

  public helpText = () => messagesText.helpText.match

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

    this.ws.sendMessage(MessageType.MATCH, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
