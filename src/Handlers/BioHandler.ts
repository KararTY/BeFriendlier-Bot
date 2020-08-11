import { MessageType, BIO, BASE } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class BioHandler extends DefaultHandler {
  public messageType = MessageType.BIO

  public prefix = ['bio']

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.makeResponseMesage(msg) as BIO

    // TODO: Add FFZ & BTTV emote detections.
    let msgText = msg.messageText
    if (words[1] === 'global') {
      msgText = words.slice(1).join(' ')
      responseMessage.global = true
    }

    responseMessage.bio = msgText.split(' ').slice(1).join(' ').substr(0, 128)

    this.ws.sendMessage(MessageType.BIO, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(channelTwitch.name, userTwitch.name, String(result.value))
  }
}
