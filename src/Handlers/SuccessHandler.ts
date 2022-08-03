import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class SuccessHandler extends DefaultHandler {
  public messageType = MessageType.SUCCESS

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, messageID, result }: BASE): Promise<void> {
    // This is a match "success".
    if (result.matchUsername !== undefined) {
      // Send to this user.
      await this.twitch.sendWhisper(
        userTwitch,
        String(result.value).replace('%s%', `@${String(result.matchUsername)}`)
      ).then(() => {
        void this.twitch.sendMessage(channelTwitch, userTwitch, '🦆 rubber ducky says: A match! Check your whispers.', messageID)
      }).catch(error => {
        this.logger.error({ err: error }, 'SuccessHandler.onServerResponse() -> Twitch.sendWhisper()')

        void this.twitch.sendMessage(
          channelTwitch,
          userTwitch,
          `whispers disabled, ${String(result.value).replace('%s%', `@${String(result.matchUsername)}`)}`,
          messageID
        )
      })

      // Send to matched user.
      await this.twitch.sendWhisper(
        { name: result.matchUsername, id: '_' }, String(result.value).replace('%s%', `@${String(userTwitch.name)}`)
      ).catch(error => {
        this.logger.error({ err: error }, 'SuccessHandler.onServerResponse() -> #2 Twitch.sendWhisper()')
      })

      this.twitch.removeUserInstance({ channelTwitch, userTwitch })
    } else {
      // This is a general acknowledgement message from the server.
      void this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value), messageID)
    }
  }
}
