import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class TakeABreakHandler extends DefaultHandler {
  public messageType = MessageType.TAKEABREAK

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch }: BASE) {
    this.twitch.sendMessage(
      channelTwitch.name,
      userTwitch.name,
      'take a break! You\'re currently on a cooldown period.',
    )

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
