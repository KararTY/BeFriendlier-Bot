import { BASE, BIO, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class BioHandler extends DefaultHandler {
  public messageType = MessageType.BIO

  public prefix = ['bio']

  public helpText = () => this.i18n(this.messagesText.helpText.bio)

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

    if (words[0] === 'global') {
      message.messageText = message.messageText.split(' ').slice(2).join(' ')
      responseMessage.global = true
    } else {
      message.messageText = message.messageText.split(' ').slice(1).join(' ')
    }

    const bioText = message.messageText

    if (bioText.length >= 1) {
      if (bioText.length > 127) {
        this.twitch.sendMessage(
          responseMessage.channelTwitch,
          responseMessage.userTwitch,
          this.i18n(this.messagesText.bioTooLong),
        )
        return
      } else if (bioText.length < 3) {
        this.twitch.sendMessage(
          responseMessage.channelTwitch,
          responseMessage.userTwitch,
          this.i18n(this.messagesText.bioTooShort),
        )
        return
      }
    }

    responseMessage.bio = bioText.substr(0, 128).trim()

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    const emotes = await this.getEmotes()

    const bio = result.value.split(' ').map((word: string) => emotes.findIndex(ee => ee.name === word) > -1 ? word : this.noPingsStr(word)).join(' ')

    this.twitch.sendMessage(channelTwitch, userTwitch, bio)
  }

  private escapeRegExp (text: string) {
    return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
  }
}
