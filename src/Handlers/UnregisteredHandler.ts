import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class UnregisteredHandler extends DefaultHandler {
  public messageType = MessageType.UNREGISTERED

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch }: BASE) {
    this.twitch.sendMessage(channelTwitch, userTwitch, 'you\'re not registered! Browse to the website to register.')

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
