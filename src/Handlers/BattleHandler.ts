import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { BASE, BATTLE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class BattleHandler extends DefaultHandler {
  public messageType = MessageType.BATTLE

  public prefix = ['battle', 'attack', 'atk', 'fight']

  public helpText = (): string => this.i18n(this.messagesText.helpText.battle)

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as BATTLE

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
        responseMessage.channelTwitch, responseMessage.userTwitch, this.i18n(this.messagesText.twitchUserNotFound), responseMessage.messageID)
      return
    }

    responseMessage.targetUserTwitch = {
      id: res[0].id,
      name: res[0].login
    }

    if (responseMessage.targetUserTwitch.id === responseMessage.userTwitch.id) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch, responseMessage.userTwitch, this.i18n(this.messagesText.sameUser), responseMessage.messageID)
      return
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: BASE): Promise<void> {
    void this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value), messageID)
  }
}
