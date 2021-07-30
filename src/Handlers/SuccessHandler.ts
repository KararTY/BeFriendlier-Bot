import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class SuccessHandler extends DefaultHandler {
  public messageType = MessageType.SUCCESS

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    // This is a match "success".
    if (result.matchUsername !== undefined) {
      // Send to this user.
      await this.twitch.sendWhisper(
        userTwitch,
        String(result.value).replace('%s%', `@${String(result.matchUsername)}`),
      ).catch(error => {
        this.logger.error({ err: error }, 'SuccessHandler.onServerResponse() -> Twitch.sendWhisper()')

        this.twitch.sendMessage(
          channelTwitch,
          userTwitch,
          `whispers disabled, ${String(result.value).replace('%s%', `@${String(result.matchUsername)}`)}`,
        )
      })

      // Send to matched user.
      await this.twitch.sendWhisper({ name: result.matchUsername, id: '_' }, String(result.value).replace('%s%', `@${String(userTwitch.name)}`),
      ).catch(error => {
        this.logger.error({ err: error }, 'SuccessHandler.onServerResponse() -> #2 Twitch.sendWhisper()')
      })

      this.twitch.removeUserInstance({ channelTwitch, userTwitch })
    } else {
      // This is a general acknowledgement message from the server.
      this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))
    }
  }
}
