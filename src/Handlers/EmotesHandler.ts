import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { BASE, Emote, EMOTES, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class EmotesHandler extends DefaultHandler {
  public messageType = MessageType.EMOTES

  public prefix = ['emotes']

  public helpText = (): string => this.i18n(this.messagesText.helpText.emotes)

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as EMOTES

    // If user is trying to see their global emotes.
    responseMessage.global = this.isGlobal(responseMessage.channelTwitch, words)

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public static async parseEmotes (msg: PrivmsgMessage, maxEmotes: number): Promise<Emote[]> {
    // TODO: Add FFZ & BTTV emote detections.
    return msg.emotes.filter((emote, index, emotes) => {
      const em = emotes.slice(index + 1).find(em => em.id === emote.id)
      if (em === undefined) {
        return true
      } else return false
    }).map(emote => {
      return {
        name: emote.code,
        id: emote.id
      }
    }).slice(0, maxEmotes)
  }

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: BASE): Promise<void> {
    void this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value), messageID)
  }
}
