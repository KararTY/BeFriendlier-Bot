import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class BotHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['bot', `${this.twitch.name}`]

  public helpText = (): string => {
    const heapUsed = process.memoryUsage().heapUsed / (1024 * 1024)
    return this.i18n(this.messagesText.helpText.bot.replace('%memory%', heapUsed.toFixed(2)))
  }

  public async onCommand (msg: PrivmsgMessage): Promise<void> {
    const responseMessage = this.getNameAndIds(msg)

    const message = `${String(this.twitch.packageJSON.description)} By N\u{E0000}otKarar. Version: ${String(this.twitch.packageJSON.version)}`

    void this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, message, responseMessage.messageID)
  }

  // public async onServerResponse (res) {}
}
