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
      this.twitch./* TODO: whisper */sendMessage(
        /** TODO. REMOVE */channelTwitch,
        userTwitch,
        String(result.value).replace('%s%', `@${String(result.matchUsername)}`),
      )

      // // Send to matched user.
      // this.twitch./* TODO: whisper */sendMessage(
      //   /** TODO. REMOVE */channelTwitch,
      //   result,
      //   String(result.value).replace('%s%', `@${String(userTwitch.name)}`),
      // )

      this.twitch.removeUserInstance({ channelTwitch, userTwitch })
    } else {
      // This is a general acknowledgement message from the server.
      this.twitch.sendMessage(channelTwitch, userTwitch, String(result.value))
    }
  }
}
