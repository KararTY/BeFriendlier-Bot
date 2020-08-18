import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'
import messagesText from '../messagesText'

export default class UnregisteredHandler extends DefaultHandler {
  public messageType = MessageType.UNREGISTERED

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch }: BASE) {
    this.twitch.sendMessage(channelTwitch, userTwitch, messagesText.unregistered)

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
