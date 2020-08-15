import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class SayHandler extends DefaultHandler {
  // public messageType = 

  public prefix = ['say']
  public adminOnly = true

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg)

    this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, words.join(' '))
  }

  // public async onServerResponse () {}
}
