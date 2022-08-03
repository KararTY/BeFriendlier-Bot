import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class WhisperHandler extends DefaultHandler {
  public messageType = MessageType.WHISPER

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: BASE): Promise<void> {
    const message = result.value.replace(/%prefix%/g, this.twitch.commandPrefix) as string

    await this.twitch.sendWhisper(userTwitch, message).catch(error => {
      this.logger.error({ err: error }, 'WhisperHandler.onServerResponse() -> Twitch.sendWhisper()')

      // We don't want to send these, gets too spammy.
      if ([
        MessageType.ROLLMATCH,
        MessageType.MATCH,
        MessageType.MISMATCH
      ].includes(result.originalType)) {
        return
      }

      void this.twitch.sendMessage(
        channelTwitch,
        userTwitch,
        `[whispers disabled] ${message}`,
        messageID
      )
    })
  }
}
