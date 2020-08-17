import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class TakeABreakHandler extends DefaultHandler {
  public messageType = MessageType.TAKEABREAK

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(
      channelTwitch,
      userTwitch,
      result !== undefined && result.value.length > 0
        ? result.value : 'take a break! You\'re currently on a cooldown period.',
    )

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
