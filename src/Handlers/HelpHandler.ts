import { PrivmsgMessage, WhisperMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class HelpHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['help', 'commands']
  public helpText = () => this.i18n(this.messagesText.helpText.help)

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg)

    const message = this.makeMessage(words)

    if (message.length > 0) {
      this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, message)
    }
  }

  public async onWhisperCommand (whMsg: WhisperMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(whMsg)

    const message = this.makeMessage(words)

    if (message.length > 0) {
      await this.twitch.sendWhisper(responseMessage.userTwitch, message)
    }
  }

  // public async onServerResponse (res) {}

  private makeMessage (words: string[]) {
    const commands = this.twitch.handlers.filter(command => !command.adminOnly && command.prefix.length !== 0)

    let message: string = ''
    if (words.length === 0) {
      message = `prepend ${this.twitch.commandPrefix} to commands: ${commands.map(command => command.prefix[0]).join(', ')}. More help in the profile page.`
    } else {
      const command = commands.find(command => command.prefix.includes(words[0]))

      if (command !== undefined) {
        message = `${command.prefix[0]}: ${command.helpText()}`
      }

      // TODO: Make it paginate.
    }

    return message
  }
}
