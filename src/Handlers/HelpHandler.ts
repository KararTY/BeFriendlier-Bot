import { PrivmsgMessage } from 'dank-twitch-irc'
import messagesText from '../messagesText'
import DefaultHandler from './DefaultHandler'

export default class HelpHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['help', 'commands']
  public helpText = () => messagesText.helpText.help

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg)

    const commands = this.twitch.handlers.filter(command => !command.adminOnly && command.prefix.length !== 0)

    let message: string = ''
    if (words.length === 0) {
      message = `prepend @@ to commands: ${commands.map(command => command.prefix[0]).join(', ')}. More help in the profile page.`
    } else {
      const command = commands.find(command => command.prefix.includes(words[0]))

      if (command !== undefined) {
        message = `${command.prefix[0]}: ${command.helpText()}`
      }

      // TODO: Make it paginate.
    }

    if (message.length > 0) {
      this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, message)
    }
  }

  // public onServerResponse (res) {}
}
