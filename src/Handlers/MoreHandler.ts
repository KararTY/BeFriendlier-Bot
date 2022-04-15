import { ROLLMATCH } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'
import { matchText } from './RollMatchHandler'

export default class MoreHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['more']

  public helpText = (): string => this.i18n(this.messagesText.helpText.more)

  public async onCommand (msg: PrivmsgMessage): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as ROLLMATCH

    const foundUserRoll = this.twitch.getUserInstance(msg)

    if (foundUserRoll === undefined) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        this.i18n(this.messagesText.notInitializedARoll)
      )
      return
    }

    void matchText(
      { ...responseMessage },
      { logger: this.logger, twitch: this.twitch, getEmotes: async () => await this.getEmotes(), i18n: { messagesText: this.messagesText, parse: (str) => this.i18n(str) }, noPingsStr: this.noPingsStr },
      foundUserRoll
    )
  }

  // public async onServerResponse (res) {}
}
