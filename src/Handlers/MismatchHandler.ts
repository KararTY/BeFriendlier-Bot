import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class MismatchHandler extends DefaultHandler {
  public messageType = MessageType.MISMATCH

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: BASE): Promise<void> {
    void this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value), messageID)

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
