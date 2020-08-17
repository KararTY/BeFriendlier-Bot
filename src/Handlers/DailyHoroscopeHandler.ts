import { PrivmsgMessage } from 'dank-twitch-irc'
import fs from 'fs'
import path from 'path'
import fetch from 'got'
import os from 'os'
import DefaultHandler from './DefaultHandler'

enum Sign {
  AQ = 'aquarius',
  PI = 'pisces',
  T = 'taurus',
  G = 'gemini',
  CAN = 'cancer',
  LE = 'leo',
  V = 'virgo',
  LI = 'libra',
  SC = 'scorpio',
  SA = 'sagittarius',
  CAP = 'capricorn',
}

interface Horoscope {
  sign: Sign
  date: string
  horoscope: string
  nextRequest: string
}

export default class DailyHoroscopeHandler extends DefaultHandler {
  // public messageType = MessageType

  public prefix = ['horoscope', 'dailyhoroscope']

  public helpText = () => {
    const signs = Object.values(Sign).map(sign => String(sign))
    return `shows daily horoscope. Available signs: ${signs.join(', ')}.`
  }

  private readonly horoscopes: Horoscope[] = []

  private readonly horoscopesDirPath: string = path.join(os.homedir(), 'horoscopes')

  public async onCommand (msg: PrivmsgMessage, words: string[]) {
    const responseMessage = this.getNameAndIds(msg)

    let horoscopeName = Sign.LE.toString()

    if (words[0] !== undefined) {
      const firstWordLowercase = words[0].toLowerCase()
      horoscopeName =
        Object.values(Sign).map(sign => String(sign)).find(signVal => signVal === firstWordLowercase) !== undefined
          ? firstWordLowercase
          : Sign.LE
    }

    let horoscope = this.horoscopes.find(horoscope => horoscope.sign === horoscopeName)

    // Load JSON or create it.
    if (horoscope === undefined) {
      let fileContent: string
      try {
        // Load JSON
        fileContent = fs.readFileSync(path.join(this.horoscopesDirPath.toString(), `horoscope_${horoscopeName}.json`), 'utf-8')
      } catch (error) {
        // Create file.
        const response = await this.requestHoroscope(horoscopeName)

        if (response !== null) {
          fileContent = JSON.stringify(response)
        } else {
          this.twitch.sendMessage(
            responseMessage.channelTwitch,
            responseMessage.userTwitch,
            'no horoscope today! Check back tomorrow?',
          )
          return
        }
      }

      this.horoscopes.push(JSON.parse(fileContent))
      horoscope = this.horoscopes.find(horoscope => horoscope.sign === horoscopeName) as Horoscope
    }

    const nextRequest = new Date(horoscope.nextRequest).getTime()
    if (Date.now() > nextRequest) {
      // Get new horoscope
      const response = await this.requestHoroscope(horoscopeName)

      if (response !== null) {
        horoscope = response
      } else {
        this.twitch.sendMessage(
          responseMessage.channelTwitch,
          responseMessage.userTwitch,
          'no horoscope today! Check back tomorrow?',
        )
        return
      }
    }

    const message = `${horoscope.sign} horoscope for date ${horoscope.date}: ${horoscope.horoscope.split('. ')[0]}...`

    this.twitch.sendMessage(responseMessage.channelTwitch, responseMessage.userTwitch, message)
  }

  private async requestHoroscope (sign: string) {
    try {
      const { body }: any = await fetch.get(`https://ohmanda.com/api/horoscope/${sign}/`, {
        headers: this.twitch.headers,
        responseType: 'json',
      })

      const nextRequest = new Date()
      nextRequest.setDate(new Date().getDate() + 1)
      body.nextRequest = nextRequest.toUTCString()

      if (!fs.existsSync(this.horoscopesDirPath)) {
        fs.mkdirSync(this.horoscopesDirPath, { recursive: true })
      }

      fs.writeFileSync(path.join(this.horoscopesDirPath.toString(), `horoscope_${sign}.json`), JSON.stringify(body), 'utf-8')

      return body as Horoscope
    } catch (error) {
      this.logger.error({ err: error }, 'DailyHoroscopeHandler.requestHoroscope()')
      return null
    }
  }

  // public onServerResponse (res) {}
}
