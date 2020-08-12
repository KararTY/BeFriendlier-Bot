import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

import os from 'os'

export default class BotHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['bot', 'befriendlier']

  public helpText = () => {
    const total = os.totalmem() / (1024 * 1024)
    const heapUsed = process.memoryUsage().heapUsed / (1024 * 1024)
    const rss = process.memoryUsage().rss / (1024 * 1024 * 100)
    return `alloc mem: ${rss / total}, mem used: ${heapUsed / total}`
  }

  public async onCommand (msg: PrivmsgMessage) {
    const message = `${String(this.twitch.packageJSON.description)} By N\u{E0000}otKarar. Version: ${String(this.twitch.packageJSON.version)}`

    this.twitch.sendMessage(msg.channelName, msg.senderUsername, message)
  }

  // public onServerResponse (res) {}
}
