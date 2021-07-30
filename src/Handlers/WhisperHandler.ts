import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class WhisperHandler extends DefaultHandler {
  public messageType = MessageType.WHISPER

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    await this.twitch.sendWhisper(userTwitch, result.value).catch(error => {
      this.logger.error({ err: error }, 'WhisperHandler.onServerResponse() -> Twitch.sendWhisper()')

      this.twitch.sendMessage(
        channelTwitch,
        userTwitch,
        result.value,
      )
    })
  }
}
