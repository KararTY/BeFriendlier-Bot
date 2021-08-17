import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class WhisperHandler extends DefaultHandler {
  public messageType = MessageType.WHISPER

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    const message = result.value.replace(/%prefix%/g, this.twitch.commandPrefix)

    await this.twitch.sendWhisper(userTwitch, message).catch(error => {
      this.logger.error({ err: error }, 'WhisperHandler.onServerResponse() -> Twitch.sendWhisper()')

      this.twitch.sendMessage(
        channelTwitch,
        userTwitch,
        `whispers disabled, ${result.value}`,
      )
    })
  }
}
