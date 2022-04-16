import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { BASE, BIO } from 'befriendlier-shared'
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
    const pajbotCheck = await this.twitch.pajbotAPI.check(responseMessage.channelTwitch.name, this.twitch.filterMsg(message.messageText))
    const pajbot2Check = await this.twitch.pajbotAPI.checkVersion2(responseMessage.channelTwitch.name, this.twitch.filterMsg(message.messageText))

    if (pajbotCheck === null || pajbot2Check === null || pajbotCheck.banned || pajbot2Check.banned) {
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

    return bioText.substring(0, 128).trim()
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE): Promise<void> {
    const emotes = await this.getEmotes()

    const bio = result.value.split(' ').map((word: string) => emotes.some(ee => ee.name === word) ? word : this.noPingsStr(word)).join(' ')

    void this.twitch.sendMessage(channelTwitch, userTwitch, bio)
  }

  private escapeRegExp (text: string): string {
    return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
  }

  public static shortenText (str: string, max = 32): string {
    return str.length > 32 ? `${str.substring(0, max)}...` : str
  }
}
