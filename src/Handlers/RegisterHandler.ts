import { PrivmsgMessage, WhisperMessage } from '@kararty/dank-twitch-irc'
import { BASE, MessageType, REGISTER } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class RegisterHandler extends DefaultHandler {
  public messageType = MessageType.REGISTER

  public prefix = ['register']

  public helpText = (): string => this.i18n(this.messagesText.helpText.register)

  public async onCommand (msg: PrivmsgMessage): Promise<void> {
    const base = this.getNameAndIds(msg)

    void this.twitch.sendMessage(base.channelTwitch, base.userTwitch, this.i18n(this.messagesText.whispersOnly))
  }

  public async onWhisperCommand (whMsg: WhisperMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(whMsg) as REGISTER

    if (words[0] !== 'accept') {
      void this.twitch.sendWhisper(responseMessage.userTwitch, this.i18n(this.messagesText.registrationDisclaimer))
      return
    }

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [whMsg.senderUsername])
    if (res === null || res.length === 0) {
      void this.twitch.sendWhisper(responseMessage.userTwitch, this.i18n(this.messagesText.twitchUserNotFound))
      return
    }

    responseMessage.userTwitch = {
      id: res[0].id,
      name: res[0].login,
      displayName: res[0].display_name,
      avatar: res[0].profile_image_url
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ userTwitch, result }: BASE): Promise<void> {
    await this.twitch.sendWhisper(userTwitch, result.value === true
      ? this.i18n(this.messagesText.registrationSuccessful)
      : this.i18n(this.messagesText.alreadyRegistered)
    )
  }
}
