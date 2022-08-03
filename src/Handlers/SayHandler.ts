import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class SayHandler extends DefaultHandler {
  // public messageType =

  public prefix = ['say']
  public adminOnly = true

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const base = this.getNameAndIds(msg)

    void this.twitch.sendMessage(base.channelTwitch, base.userTwitch, words.join(' '), msg.messageID)
  }

  // public async onServerResponse () {}
}
