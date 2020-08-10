import { JOINCHAT, MessageType } from 'befriendlier-shared'
import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class JoinChannelHandler extends DefaultHandler {
  public messageType = MessageType.JOINCHAT

  public prefix = ['join']

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.makeResponseMesage(msg) as JOINCHAT

    // Get user details for provided user.
    const res = await this.twitch.api.getUser(this.twitch.token.superSecret, [words[1]])
    if (res !== null && res.length > 0) {
      responseMessage.joinUserTwitch = {
        id: res[0].id,
        name: res[0].login,
      }

      this.ws.sendMessage(MessageType.JOINCHAT, JSON.stringify(responseMessage))
    } else {
      this.twitch.sendMessage(msg.channelName, msg.senderUsername, 'could not find that user on Twitch.')
    }
  }

  public async onServerResponse ({ /* channelTwitch, userTwitch */ joinUserTwitch }: JOINCHAT) {
    const foundExistingChannel = this.twitch.channels.get(joinUserTwitch.name)

    if (foundExistingChannel !== undefined) {
      this.logger.warn(`Twitch.joinChannel(): Tried to join a channel already in cached, named ${joinUserTwitch.name}.`)
      return
    }

    await this.twitch.checkReady()

    return await this.twitch.ircClient.join(joinUserTwitch.name).then(() => {
      this.logger.info(`Twitch.JOIN: Joined ${joinUserTwitch.name}.`)

      // if (channelTwitch !== undefined && userTwitch !== undefined) {
      // this.twitch.sendMessage(
      //   joinUserTwitch.name,
      //   userTwitch.name,
      //   `from channel @${channelTwitch.name}, has added this channel to the service!` +
      //   'BeFriendlier.app for more information.`,
      // )
      // }

      this.twitch.joinChannel(joinUserTwitch)

      // Tell server our new channels list.
      // eslint-disable-next-line no-void
      void this.twitch.handlers.find(command => command.messageType === MessageType.CHATS)?.onCommand()
    }).catch(error => {
      this.logger.error({ err: error }, 'Twitch.joinChannel() -> Twitch.JOIN')
    })
  }
}
