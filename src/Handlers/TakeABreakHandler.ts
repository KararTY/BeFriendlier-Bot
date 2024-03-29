import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class TakeABreakHandler extends DefaultHandler {
  public messageType = MessageType.TAKEABREAK

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: BASE): Promise<void> {
    void this.twitch.sendMessage(
      channelTwitch,
      userTwitch,
      result !== undefined && result.value.length > 0 ? result.value : this.i18n(this.messagesText.takeABreak),
      messageID
    )

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
