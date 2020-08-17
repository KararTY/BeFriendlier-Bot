# BeFriendlier-Bot
Looking to match with POG Twitch friends?

## External APIs in use:
  * [Amanda Y Huang's API wrapper of Astrology.com](https://ohmanda.com/api/horoscope)

## Setup
  * `npm i` / `yarn i` / `pnpm i --shamefully-hoist` to install packages.
  * Copy `.env.example`, to a new file named `.env`.
  * Change the environment values in the new `.env` file.
  * Check `config/` directory for other configurations to change. Default config values should be sufficient for development, however.
  * `npm start-test` to start bot client in watch mode (Reloads on file change) with debugging websocket enabled.
  * Or alternatively `npm start` to start bot client in "production" mode (No reloading on file change and no debugging websocket).
  * The bot will not join any channels by default unless the bot receives JOINCHAT messagetype from the website.


## Changelogs
  * [Website](https://github.com/KararTY/BeFriendlier-Web/blob/master/CHANGELOG.md)
  * [Bot](CHANGELOG.md)
  * [Shared](https://github.com/KararTY/BeFriendlier-Shared/blob/master/CHANGELOG.md)

## Todo
[Check project page for Todo list.](https://github.com/users/KararTY/projects/1)
