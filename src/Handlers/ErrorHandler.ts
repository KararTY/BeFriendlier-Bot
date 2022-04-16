import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class ErrorHandler extends DefaultHandler {
  public messageType = MessageType.ERROR

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE): Promise<void> {
    void this.twitch.sendMessage(channelTwitch, userTwitch, result.value)

    this.twitch.removeUserInstance({ userTwitch, channelTwitch })
  }
}
