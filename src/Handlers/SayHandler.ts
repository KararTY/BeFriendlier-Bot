import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class SayHandler extends DefaultHandler {
  // public messageType = 

  public prefix = ['say']
  public adminOnly = true

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    this.twitch.sendMessage(msg.channelName, msg.senderUsername, words.join(' '))
  }

  // public async onServerResponse () {}
}
