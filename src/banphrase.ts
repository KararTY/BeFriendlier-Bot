import { PajbotAPI } from 'befriendlier-shared'
import logger from '../logger'

import PajbotConfig from '../config/Pajbot'

const pajAPIConfig = new PajbotConfig()
const pajbotAPI = new PajbotAPI(pajAPIConfig, logger.level)

async function pajbotBanphraseCheck (channelName: string, message: string): Promise<string[]> {
  const checkMessages: string[] = []

  const pajbotCheck = await pajbotAPI.check(channelName, message)
  if (pajbotCheck === null) {
    checkMessages.push('Banphrase v1 API is offline.')
  } else if (pajbotCheck.banned) {
    // banphrase_data appears on banned === true
    // const banphraseData = pajbotCheck.banphrase_data as { phrase: string }
    logger.warn('"%s" contains bad words (%s)', message, JSON.stringify(pajbotCheck.banphrase_data))
    checkMessages.push('(v1) message contains banned phrases.')
  }

  const pajbot2Check = await pajbotAPI.checkVersion2(channelName, message)
  if (pajbot2Check === null) {
    checkMessages.push('Banphrase v2 API is offline.')
  } else if (pajbot2Check.banned) {
    // banphrase_data appears on banned === true
    // const banphraseData = pajbotCheck.banphrase_data as { phrase: string }
    logger.warn('"%s" contains bad words (%s)', message, JSON.stringify(pajbot2Check.filter_data))
    checkMessages.push('(v2) message contains banned phrases.')
  }

  return checkMessages
}

export default pajbotBanphraseCheck
