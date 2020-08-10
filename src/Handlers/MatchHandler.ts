import { BASE, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class MatchHandler extends DefaultHandler {
  public messageType = MessageType.MATCH

  public prefix = ['match', 'yes']

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.makeResponseMesage(msg)

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll === undefined) {
      return
    }

    this.ws.sendMessage(MessageType.MATCH, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(channelTwitch.name, userTwitch.name, String(result.value))

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
