import { BASE, BIO, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import messagesText from 'src/messagesText'
import DefaultHandler from './DefaultHandler'

export default class BioHandler extends DefaultHandler {
  public messageType = MessageType.BIO

  public prefix = ['bio']

  public helpText = () => messagesText.helpText.bio

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg) as BIO

    // Filter bad words.
    const message = { ...msg }
    if (msg.flags instanceof Array) {
      for (let index = 0; index < msg.flags.length; index++) {
        const word = msg.flags[index].word
        const censorStars = Array(word.length).fill('*').join('')
        message.messageText = message.messageText.replace(new RegExp(this.escapeRegExp(word)), censorStars)
      }
    }

    // TODO: Add FFZ & BTTV emote detections.
    if (words[0] === 'global') {
      message.messageText = words.slice(1).join(' ')
      responseMessage.global = true
    }

    const bioText = message.messageText.split(' ').slice(1)

    if (bioText.length > 1) {
      if (bioText.length > 127) {
        this.twitch.sendMessage(
          responseMessage.channelTwitch,
          responseMessage.userTwitch,
          messagesText.bioTooLong,
        )
        return
      } else if (bioText.length < 3) {
        this.twitch.sendMessage(
          responseMessage.channelTwitch,
          responseMessage.userTwitch,
          messagesText.bioTooShort,
        )
        return
      }
    }

    responseMessage.bio = bioText.join(' ').substr(0, 128)

    this.ws.sendMessage(MessageType.BIO, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))
  }

  private escapeRegExp (text: string) {
    return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
  }
}
