import { LEAVECHAT, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import messagesText from 'src/messagesText'
import DefaultHandler from './DefaultHandler'

export default class LeaveChannelHandler extends DefaultHandler {
  public messageType = MessageType.LEAVECHAT

  public prefix = ['leave']
  public adminOnly = true

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    // When the bot gets banned, the userTwitch's variables are empty.
    const responseMessage = this.getNameAndIds(msg) as LEAVECHAT

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [words[0]])
    if (res !== null && res.length > 0) {
      responseMessage.leaveUserTwitch = {
        id: res[0].id,
        name: res[0].login,
      }

      this.ws.sendMessage(MessageType.LEAVECHAT, JSON.stringify(responseMessage))
    } else {
      this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        messagesText.twitchUserNotFound,
      )
    }
  }

  public async onServerResponse ({ channelTwitch, userTwitch, leaveUserTwitch }: LEAVECHAT) {
    // When the bot gets banned, it doesn't need to announce that it's leaving, so userTwitch's variables are empty.
    if (userTwitch.name.length > 0 && userTwitch.id.length > 0) {
      this.twitch.sendMessage(
        leaveUserTwitch,
        userTwitch,
        `from channel @${channelTwitch.name}, has issued me to leave this channel. FeelsBadMan Good bye!`,
      )
    }

    this.twitch.leaveChannel(leaveUserTwitch)
  }
}
