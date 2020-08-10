import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class ErrorHandler extends DefaultHandler {
  public messageType = MessageType.ERROR

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(channelTwitch.name, userTwitch.name, result.value)

    this.twitch.removeUserInstance({ userTwitch, channelTwitch })
  }
}
