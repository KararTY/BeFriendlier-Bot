import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class MismatchHandler extends DefaultHandler {
  public messageType = MessageType.MISMATCH

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE): Promise<void> {
    void this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
