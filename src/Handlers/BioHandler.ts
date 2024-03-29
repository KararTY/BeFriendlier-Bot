import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { BASE, BIO } from 'befriendlier-shared'
import pajbotBanphraseCheck from '../banphrase'
import DefaultHandler from './DefaultHandler'

export default class BioHandler extends DefaultHandler {
  public static async parseBio (this: BioHandler, msg: PrivmsgMessage, words: string[]): Promise<string> {
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

    if (this.isGlobal(responseMessage.channelTwitch, words)) {
      message.messageText = message.messageText.split(' ').slice(2).join(' ')
      this.twitch.userCooldowns.set(msg.senderUserID, new Date(Date.now() + 60000))
    } else {
      message.messageText = message.messageText.split(' ').slice(1).join(' ')
    }

    if (message.messageText.length === 0) return ''

    // Check pajbots.
    const checkMessages = await pajbotBanphraseCheck(responseMessage.channelTwitch.name, this.twitch.filterMsg(message.messageText))

    if (checkMessages.length > 0) {
      throw new Error('BANNED_PHRASES')
    }

    const bioText = message.messageText

    if (bioText.length > 0) {
      if (bioText.length > 128) {
        throw new Error('BIO_TOO_LONG')
      } else if (bioText.length < 3) {
        throw new Error('BIO_TOO_SHORT')
      }
    }

    return BioHandler.shortenText(bioText, 128)
  }

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: BASE): Promise<void> {
    const emotes = await this.getEmotes()

    const bio = result.value.split(' ').map((word: string) => emotes.some(ee => ee.name === word) ? word : this.noPingsStr(word)).join(' ')

    void this.twitch.sendMessage(channelTwitch, userTwitch, bio, messageID)
  }

  private escapeRegExp (text: string): string {
    return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
  }

  public static shortenText (str: string, max = 32): string {
    return (str.length > max ? `${str.substring(0, max)}...` : str).trim()
  }
}
