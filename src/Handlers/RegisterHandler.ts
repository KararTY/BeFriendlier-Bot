import { BASE, MessageType, REGISTER } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'
import { PrivmsgMessage, WhisperMessage } from 'dank-twitch-irc'

export default class RegisterHandler extends DefaultHandler {
  public messageType = MessageType.REGISTER

  public prefix = ['register']

  public helpText = () => this.i18n(this.messagesText.helpText.register)

  public async onCommand (msg: PrivmsgMessage) {
    const base = this.getNameAndIds(msg)
  
    this.twitch.sendMessage(base.channelTwitch, base.userTwitch, this.i18n(this.messagesText.whispersOnly))
  }

  public async onWhisperCommand (whMsg: WhisperMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(whMsg) as REGISTER

    if (words[0] !== 'accept') {
      await this.twitch.sendWhisper(responseMessage.userTwitch, this.i18n(this.messagesText.registrationDisclaimer))
      return
    }

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [whMsg.senderUsername])
    if (res !== null && res.length > 0) {
      responseMessage.userTwitch = {
        id: res[0].id,
        name: res[0].login,
        displayName: res[0].display_name,
        avatar: res[0].profile_image_url
      }

      this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
    } else {
      await this.twitch.sendWhisper(responseMessage.userTwitch, this.i18n(this.messagesText.twitchUserNotFound))
    }
  }

  public async onServerResponse ({ userTwitch, result }: BASE) {
    await this.twitch.sendWhisper(userTwitch, result.value
      ? this.i18n(this.messagesText.registrationSuccessful)
      : this.i18n(this.messagesText.alreadyRegistered)
    )
  }
}
