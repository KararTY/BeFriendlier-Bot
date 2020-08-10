import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class MismatchHandler extends DefaultHandler {
  public messageType = MessageType.MISMATCH

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(channelTwitch.name, userTwitch.name, String(result.value))

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
