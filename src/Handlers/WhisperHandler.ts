import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class WhisperHandler extends DefaultHandler {
  public messageType = MessageType.WHISPER

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE): Promise<void> {
    const message = result.value.replace(/%prefix%/g, this.twitch.commandPrefix) as string

    await this.twitch.sendWhisper(userTwitch, message).catch(error => {
      this.logger.error({ err: error }, 'WhisperHandler.onServerResponse() -> Twitch.sendWhisper()')

      void this.twitch.sendMessage(
        channelTwitch,
        userTwitch,
        `[whispers disabled] ${message}`
      )
    })
  }
}
