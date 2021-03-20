import { BASE, EMOTES, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import messagesText from '../messagesText'
import DefaultHandler from './DefaultHandler'

export default class EmotesHandler extends DefaultHandler {
  public messageType = MessageType.EMOTES

  public prefix = ['emotes']

  public helpText = () => {
    return messagesText.helpText.emotes
  }

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg) as EMOTES

    // TODO: Add FFZ & BTTV emote detections.

    responseMessage.emotes = msg.emotes.filter((emote, index, emotes) => {
      const em = emotes.slice(index + 1).find(em => em.id === emote.id)
      if (em === undefined) {
        return true
      }
    }).map(emote => {
      return {
        name: emote.code,
        id: emote.id,
      }
    }).slice(0, 5)

    // If user is trying to change their global emotes.
    responseMessage.global = words[0] === 'global'

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))
  }
}
