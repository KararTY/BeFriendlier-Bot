import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class BotHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['bot']

  public async onCommand (msg: PrivmsgMessage) {
    const message = `${String(this.twitch.packageJSON.description)} By n\u{0000}otkarar. Version: ${String(this.twitch.packageJSON.version)}`

    this.twitch.sendMessage(msg.channelName, msg.senderUsername, message)
  }

  // public onServerResponse (res) {}
}
