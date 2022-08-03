import { PrivmsgMessage } from '@kararty/dank-twitch-irc'
import { JOINCHAT, MessageType } from 'befriendlier-shared'
import DefaultHandler from './DefaultHandler'

export default class JoinChannelHandler extends DefaultHandler {
  public messageType = MessageType.JOINCHAT

  public prefix = ['join']
  public adminOnly = true

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg) as JOINCHAT
    responseMessage.messageID = msg.messageID

    if (words[0] === undefined) {
      void this.twitch.sendMessage(
        responseMessage.channelTwitch,
        responseMessage.userTwitch,
        this.getHelpMessage(),
        responseMessage.messageID
      )
      return
    }

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

    responseMessage.joinUserTwitch = {
      id: res[0].id,
      name: res[0].login
    }

    this.ws.sendMessage(this.messageType, JSON.stringify(responseMessage))
  }

  public async onServerResponse ({ /* channelTwitch, userTwitch */ joinUserTwitch }: JOINCHAT): Promise<void> {
    const foundExistingChannel = this.twitch.channels.get(joinUserTwitch.name)

    if (foundExistingChannel !== undefined) {
      this.logger.warn(`JoinChatHandler.onServerResponse(): Tried to join a channel already in cache, named ${joinUserTwitch.name}.`)
      return
    }

    await this.twitch.checkReady()

    return await this.twitch.ircClient.join(joinUserTwitch.name).then(() => {
      this.logger.info(`JoinChatHandler.onServerResponse() -> Twitch.JOIN: Joined ${joinUserTwitch.name}.`)

      // if (userTwitch.id.length > 0 && userTwitch.name.length > 0) {
      // this.twitch.sendMessage(
      //   joinUserTwitch,
      //   userTwitch,
      //   `from channel @${channelTwitch.name}, has added this channel to the service!` +
      //   'BeFriendlier.app for more information.`,
      // )
      // }

      this.twitch.joinChannel(joinUserTwitch)

      // Tell server our new channels list.
      void this.twitch.handlers.find(command => command.messageType === MessageType.CHATS)?.onCommand()
    }).catch(error => {
      this.logger.error({ err: error }, 'JoinChatHandler.onServerResponse() -> Twitch.JOIN')
    })
  }
}
