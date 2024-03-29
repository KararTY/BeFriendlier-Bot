import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class UnregisteredHandler extends DefaultHandler {
  public messageType = MessageType.UNREGISTERED

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, messageID }: BASE): Promise<void> {
    void this.twitch.sendMessage(channelTwitch, userTwitch, this.i18n(this.messagesText.unregistered), messageID)

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
