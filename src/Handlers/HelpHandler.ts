import { PrivmsgMessage, WhisperMessage } from '@kararty/dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class HelpHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['help', 'commands']
  public helpText = (): string => this.i18n(this.messagesText.helpText.help)

  public async onCommand (msg: PrivmsgMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(msg)

    const message = this.makeMessage(words)

    if (message.length > 0) {
      void this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, message)
    }
  }

  public async onWhisperCommand (whMsg: WhisperMessage, words: string[]): Promise<void> {
    const responseMessage = this.getNameAndIds(whMsg)

    const message = this.makeMessage(words)

    if (message.length > 0) {
      await this.twitch.sendWhisper(responseMessage.userTwitch, message)
    }
  }

  // public async onServerResponse (res) {}

  private makeMessage (words: string[]): string {
    const commands = this.twitch.handlers.filter(command => !command.adminOnly && command.prefix.length !== 0)

    let message: string = ''
    if (words.length === 0) {
      const commandsStr = commands.filter(command => command.helpText() !== null)
        .map(command => command.prefix[0]).join(', ')

      message = `prepend ${this.twitch.commandPrefix} to commands: ${commandsStr}. More help in the profile page.`
    } else {
      const command = commands.find(command => command.prefix.includes(words[0]))

      if (command !== undefined) {
        message = command.getHelpMessage()
      }

      // TODO: Make it paginate.
    }

    return message
  }
}
