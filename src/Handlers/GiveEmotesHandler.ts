import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { Emote, GIVEEMOTES, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class GiveEmotesHandler extends DefaultHandler {
  public messageType = MessageType.GIVEEMOTES

  public prefix = ['giveemotes']

  public helpText = (): string => this.i18n(this.messagesText.helpText.giveEmotes)

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as GIVEEMOTES
    responseMessage.messageID = msg.messageID

    if (words[0] === undefined) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch, responseMessage.userTwitch, this.getHelpMessage(), responseMessage.messageID)
      return
    }

    // Letters, numbers, underscore.
    words[0] = encodeURIComponent(words[0].replace(/[^\w]/g, ''))

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [words[0]])
    if (res === null || res.length === 0) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        this.i18n(this.messagesText.twitchUserNotFound),
        responseMessage.messageID
      )
      return
    }

    responseMessage.recipientUserTwitch = {
      id: res[0].id,
      name: res[0].login
    }

    if (responseMessage.recipientUserTwitch.id === responseMessage.userTwitch.id) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        this.i18n(this.messagesText.sameUser),
        responseMessage.messageID
      )
      return
    }

    responseMessage.emotes = this.parseEmotes(msg, words.slice(1))

    if (responseMessage.emotes.length === 0) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        this.i18n(this.messagesText.noEmotes),
        responseMessage.messageID
      )
      return
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: GIVEEMOTES): Promise<void> {
    void this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value), messageID)
  }

  public parseEmotes (msg: PrivmsgMessage, words: string[]): Emote[] {
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
          amount: Number(amount) - 1 // Minus one because we add it later on.
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
          amount: 1
        })
      } else {
        (existingEmote.amount as number) += 1
      }
    }

    return emotes
  }
}
