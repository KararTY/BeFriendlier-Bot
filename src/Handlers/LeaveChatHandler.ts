import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { LEAVECHAT, MessageType, NameAndId } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class LeaveChannelHandler extends DefaultHandler {
  public messageType = MessageType.LEAVECHAT

  public prefix = ['leave']
  public adminOnly = true

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as LEAVECHAT

    // if (words[0] === undefined) {
    //   void this.twitch.sendMessage(
    //     responseMessage.channelTwitch, responseMessage.userTwitch, this.getHelpMessage())
    //   return
    // }

    // Letters, numbers, underscore.
    words[0] = encodeURIComponent(words[0].replace(/[^\w]/g, ''))

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [words[0]])
    if (res === null || res.length === 0) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        this.i18n(this.messagesText.twitchUserNotFound),
        responseMessage.messageID
      )
      return
    }

    responseMessage.leaveUserTwitch = {
      id: res[0].id,
      name: res[0].login
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onBanned ({ id, name }: NameAndId): Promise<void> {
    const responseMessage = {
      userTwitch: { name: '', id: '' },
      leaveUserTwitch: {
        name,
        id
      }
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ /* channelTwitch, userTwitch, */ leaveUserTwitch }: LEAVECHAT): Promise<void> {
    // When the bot gets banned, it doesn't need to announce that it's leaving, so userTwitch's variables are empty.
    // if (userTwitch.name.length > 0 && userTwitch.id.length > 0) {
    //   void this.twitch.sendMessage(
    //     leaveUserTwitch,
    //     userTwitch,
    //     `from channel @${channelTwitch.name}, has issued me to leave this channel. FeelsBadMan Good bye!`
    //   )
    // }

    this.twitch.leaveChannel(leaveUserTwitch)
  }
}
