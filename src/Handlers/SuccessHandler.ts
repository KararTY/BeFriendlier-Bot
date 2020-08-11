import { BASE, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class SuccessHandler extends DefaultHandler {
  public messageType = MessageType.SUCCESS

  // public prefix = ['']

  // public async onCommand (msg: PrivmsgMessage) {}

  public async onServerResponse ({ channelTwitch, userTwitch, result }: BASE) {
    // Send to this user.
    this.twitch./* TODO: whisper */sendMessage(
      /** TODO. REMOVE */channelTwitch.name,
      userTwitch.name,
      String(result.value).replace('%s%', `@${String(result.matchUsername)}`),
    )

    // // Send to matched user.
    // this.twitch./* TODO: whisper */sendMessage(
    //   /** TODO. REMOVE */channelTwitch.name,
    //   result.matchUsername,
    //   String(result.value).replace('%s%', `@${String(userTwitch.name)}`),
    // )

    this.twitch.removeUserInstance({ channelTwitch, userTwitch })
  }
}
