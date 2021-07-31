import { Emote, GIVEEMOTES, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import messagesText from '../messagesText'
import DefaultHandler from './DefaultHandler'

export default class GiveEmotesHandler extends DefaultHandler {
  public messageType = MessageType.GIVEEMOTES

  public prefix = ['giveemotes']

  public helpText = () => messagesText.helpText.giveEmotes

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg) as GIVEEMOTES

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [words[0]])

    if (res !== null && res.length > 0) {
      responseMessage.recipientUserTwitch = {
        id: res[0].id,
        name: res[0].login,
      }

      if (responseMessage.recipientUserTwitch.id === responseMessage.userTwitch.id) {
        return this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, messagesText.sameUser)
      }

      responseMessage.emotes = this.parseEmotes(msg, words.slice(1))

      if (responseMessage.emotes.length === 0) {
        return this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, messagesText.noEmotes)
      }

      this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
    } else {
      this.twitch.sendMessage(
        responseMessage.channelTwitch, responseMessage.userTwitch, messagesText.twitchUserNotFound)
    }
  }

  public async onServerResponse ({ channelTwitch, userTwitch, result } : GIVEEMOTES) {
    this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))
  }

  public parseEmotes (msg: PrivmsgMessage, words: string[]) {
    // Some kind of god of parsing
    // 10 Kappa
    // 10 Kappa 10 Kappa
    // Kappa Kappa Kappa Kappa
    // 5 Keepo 7 forsenE
    const matches = words.join(' ').match(/([0-9]+) ([a-zA-Z]+)/g) ?? []

    const emotes: Emote[] = []
    for (let index = 0; index < matches.length; index++) {
      const [amount, name] = matches[index].split(' ')

      const emote = msg.emotes.find(emote => emote.code === name)

      if (emote === undefined) {
        continue
      }

      const existingEmote = emotes.find(e => e.name === name)
      if (existingEmote === undefined) {
        emotes.push({
          id: emote.id,
          name: emote.code,
          amount: Number(amount) - 1, // Minus one because we add it later on.
        })
      } else {
        (existingEmote.amount as number) += Number(amount)
      }
    }

    for (let index = 0; index < msg.emotes.length; index++) {
      const emote = msg.emotes[index]

      const existingEmote = emotes.find(e => e.name === emote.code)
      if (existingEmote === undefined) {
        emotes.push({
          id: emote.id,
          name: emote.code,
          amount: 1,
        })
      } else {
        (existingEmote.amount as number) += 1
      }
    }

    return emotes
  }
}
