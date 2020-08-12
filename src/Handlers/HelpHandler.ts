import { PrivmsgMessage } from 'dank-twitch-irc'
import DefaultHandler from './DefaultHandler'

export default class HelpHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['commands', 'help']
  public helpText = () => 'rubber ducky 🦆 Never lucky.'

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const commands = this.twitch.handlers.filter(command => !command.adminOnly)

    let message: string = ''
    if (words.length === 0) {
      message = `prepend @@ to commands: ${commands.map(command => command.prefix[0]).join(', ')}. More help in the profile page.`
    } else {
      const command = commands.find(command => command.prefix.includes(words[0]))

      if (command !== undefined) {
        message = `${command.prefix[0]} help text: ${command.helpText()}`
      }
      // TODO: Make it paginate.
    }

    if (message.length > 0) {
      this.twitch.sendMessage(msg.channelName, msg.senderUsername, message)
    }
  }

  // public onServerResponse (res) {}
}
