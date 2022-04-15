import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { BASE, MessageType, PROFILE } from 'befriendlier-shared'
import BioHandler from './BioHandler'
import DefaultHandler from './DefaultHandler'
import EmotesHandler from './EmotesHandler'

export default class ProfileHandler extends DefaultHandler {
  public messageType = MessageType.PROFILE

  public prefix = ['profile', 'bio']

  public helpText = (): string => this.i18n(this.messagesText.helpText.profile)

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as PROFILE

    responseMessage.global = this.isGlobal(responseMessage.channelTwitch, words)

    try {
      let bioReq = ''
      if (msg.messageText.length > 0) bioReq = await BioHandler.parseBio.call(this, msg, words)
      const emoteReq = await EmotesHandler.parseEmotes.call(this, msg, 3)

      responseMessage.bio = bioReq
      responseMessage.emotes = emoteReq

      this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
    } catch (error) {
      switch (error.message) {
        case 'BANNED_PHRASES':
          void this.twitch.sendMessage(
            responseMessage.channelTwitch,
            responseMessage.userTwitch,
            this.i18n(this.messagesText.bannedPhrases)
          )
          break
        case 'BIO_TOO_LONG':
          void this.twitch.sendMessage(
            responseMessage.channelTwitch,
            responseMessage.userTwitch,
            this.i18n(this.messagesText.bioTooLong)
          )
          break
        case 'BIO_TOO_SHORT':
          void this.twitch.sendMessage(
            responseMessage.channelTwitch,
            responseMessage.userTwitch,
            this.i18n(this.messagesText.bioTooShort)
          )
          break
      }
    }
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE): Promise<void> {
    const emotes = await this.getEmotes()

    emotes.push(...result.value.emotes)

    const bio = BioHandler.shortenText(
      result.value.bio
        .split(' ')
        .map((word: string) => emotes.some(ee => ee.name === word) ? word : this.noPingsStr(word))
        .join(' ')
    )

    void this.twitch.sendMessage(channelTwitch, userTwitch, `your profile bio: ${bio}`)
  }
}
