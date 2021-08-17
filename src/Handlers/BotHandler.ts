import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class BotHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['bot', `${this.twitch.name}`]

  public helpText = () => {
    const heapUsed = process.memoryUsage().heapUsed / (1024 * 1024)
    return this.i18n(this.messagesText.helpText.bot.replace('%s', heapUsed.toFixed(2)))
  }

  public async onCommand (msg: PrivmsgMessage) {
    const responseMessage = this.getNameAndIds(msg)
    const message = `${String(this.twitch.packageJSON.description)} By N\u{E0000}otKarar. Version: ${String(this.twitch.packageJSON.version)}`

    this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, message)
  }

  // public async onServerResponse (res) {}
}
