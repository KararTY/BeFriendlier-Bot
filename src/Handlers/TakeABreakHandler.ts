import { BASE, MessageType } from 'befriendlier-shared'
import messagesText from '../messagesText'
import DefaultHandler from './DefaultHandler'

export default class TakeABreakHandler extends DefaultHandler {
  public messageType = MessageType.TAKEABREAK

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(
      channelTwitch,
      userTwitch,
      result !== undefined && result.value.length > 0 ? result.value : messagesText.takeABreak,
    )

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
