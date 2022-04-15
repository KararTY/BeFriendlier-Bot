const messagesText = {
  notInitializedARoll: 'you\'ve not rolled a match yet, use %prefix%swipe or %prefix%roll first.',
  bioTooLong: 'your bio is too long. 128 characters max.',
  bioTooShort: 'your bio is too short. 3 minimum characters.',
  twitchUserNotFound: 'could not find that user on Twitch.',
  takeABreak: 'take a break! You\'re currently on a cooldown period.',
  unregistered: 'you\'re not registered! DM me "%prefix%register" for more information.',
  noHoroscope: 'no horoscope today! Check back tomorrow?',
  sameUser: 'recipient user is the same user as you.',
  noEmotes: 'you\'ve not entered any Twitch emotes in your message.',
  registrationDisclaimer: 'By registering, you accept BeFriendlier\'s Privacy Policy https://befriendlier.app/privacy and Terms of Service https://befriendlier.app/terms' +
    ' We save some of your public Twitch data on BeFriendlier\'s server, and by registering you\'re creating an account on the website. Reply with "%prefix%register accept"' +
    ' to accept the Privacy policy and Terms of Service.',
  registrationSuccessful: 'Welcome to BeFriendlier! You can now use the bot and match with other people & collect emotes.' +
    ' Don\'t forget to set your profile\'s %prefix%bio and %prefix%emotes! If you want to set your user\'s favorite streamers, you must do it via the website.' +
    ' YOU MUST LOGIN VIA THE WEBSITE TO ENABLE YOUR GLOBAL PROFILE. Read more on website or on my Twitch profile page.',
  alreadyRegistered: 'You\'re already registered! You can now peruse the bot and website.',
  whispersOnly: 'this command can only be used via whispers!',
  ood: 'that\'s all that\'s written.',
  alreadyRolling: 'you\'re already rolling for a match! Reply with %prefix%more, %prefix%match, %prefix%no',
  bannedPhrases: 'that contains banned phrases. Please double check your input.',
  banphraseAPIOffline: 'the banphrase API is offline, cannot comply.',
  helpText: {
    help: 'rubber ducky 🦆 Never lucky.',
    emotes: 'see the emotes set for this profile. Only Twitch emotes work for now. Add "global" in the beginning to see your global profile\'s emotes.',
    profile: 'shows or sets your profile bio & emotes. Add "global" in the beginning to change your global profile\'s bio.',
    bot: 'mem used: ~%memory% MB.',
    horoscope: 'shows daily horoscope. Available signs: %s.',
    none: 'This command has no help usage.',
    match: 'attempts to match with the profile.',
    more: 'returns more information about the rolled profile.',
    no: 'will add the rolled profile to your mismatches.',
    ping: 'returns ping info about Twitch IRC & Website.',
    rollMatch: 'initiates a match! Good luck, rubber ducky 🦆 Append "global" to initiate a match with global profiles.',
    unmatch: 'unmatches with the provided user. Append "global" to unmatch with a user in your global profile.',
    giveEmotes: 'lets you trade your emotes with another BeFriendlier user. (<recipient name> <amount> <emote name>)',
    register: 'creates an account for you on BeFriendlier\'s website befriendlier(dot)app and allows you to use the bot.'
      + ' Can only be used via whisper.'
  }
}

export default messagesText
