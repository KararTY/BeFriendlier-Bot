# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 0.0.2 (2020-08-17)


### Features

* Add !befriendlier & @[@befriendlier](https://github.com/befriendlier) ([55a2274](https://github.com/KararTY/BeFriendlier-Bot/commit/55a227404a29cac500828161b1d42b4e1749f16a))
* Add help command & HelpHandler. ([fb83c00](https://github.com/KararTY/BeFriendlier-Bot/commit/fb83c002dc73c0b775a4b671558cae3a1abd16c8))
* Add horoscope command & API. ([899b588](https://github.com/KararTY/BeFriendlier-Bot/commit/899b5881de2e188207bda3370709ca2ae921b349))
* Add new BIO command handler. ([b75d575](https://github.com/KararTY/BeFriendlier-Bot/commit/b75d5750ed7d21e963e4be4f455ebb9194e69d55))
* Bot will issue LEAVECHAT on ban. ([14c6772](https://github.com/KararTY/BeFriendlier-Bot/commit/14c6772337d5fda3810cb37e6d6d57461239c539))
* Return only a maximum of 5 unique emotes. ([09a3342](https://github.com/KararTY/BeFriendlier-Bot/commit/09a3342ffed9eaabc1985c53f6100af07c405ae6))
* Say command. ([fbf089d](https://github.com/KararTY/BeFriendlier-Bot/commit/fbf089d42291de01deede6cf87157168181b9228))
* Send SUCCESS messages via whispers. ([4ee5d08](https://github.com/KararTY/BeFriendlier-Bot/commit/4ee5d080bf394bbec37025613fef94715e226b1f))
* SuccessHandler now handles general messages. ([71d2309](https://github.com/KararTY/BeFriendlier-Bot/commit/71d230968eb881d2577eb34c5b133d5363e17027))


### Bug Fixes

* "Self-made" 30s message cooldown bypasser. ([352b9d6](https://github.com/KararTY/BeFriendlier-Bot/commit/352b9d648979ee4f7f5d3ccbbd49f8bc7fd6c583))
* @[@help](https://github.com/help) should no longer return asterisks. ([bf23094](https://github.com/KararTY/BeFriendlier-Bot/commit/bf230944d844c61ea3a682cf60ed340a922f4a95))
* Add admin checks for leave & join commands. ([c7aaf4c](https://github.com/KararTY/BeFriendlier-Bot/commit/c7aaf4c4d991eea70540d4ad983d9035c7f3b60f))
* Add creator to @[@bot](https://github.com/bot) message. ([a4dea39](https://github.com/KararTY/BeFriendlier-Bot/commit/a4dea39d82e55831913c16eba734ee730b4cd045))
* Add pnpm to update script. ([11edeb9](https://github.com/KararTY/BeFriendlier-Bot/commit/11edeb984b38de812af0081de5e6632689f16b4f))
* Add strict to tsconfig, resolve those issues. ([00f26d9](https://github.com/KararTY/BeFriendlier-Bot/commit/00f26d9b3a9f26b9591ad570149a9be7883c389c))
* admins -> ADMINS ([e56da46](https://github.com/KararTY/BeFriendlier-Bot/commit/e56da460af0b1c49f0a38f5ff9440d3aec1d1e2a))
* Admins can now be added ([1585917](https://github.com/KararTY/BeFriendlier-Bot/commit/158591778215092528adf2bea215e51f8af63f89))
* Allow global bio to be changed via command. ([fcb54e8](https://github.com/KararTY/BeFriendlier-Bot/commit/fcb54e84bd91ce958438e3e7eb4586900466f5dd))
* Allow global matching. ([e418103](https://github.com/KararTY/BeFriendlier-Bot/commit/e4181039eb06368c48919013661c0f37b26b7182))
* Build script fix & Add update script. ([9b3cffe](https://github.com/KararTY/BeFriendlier-Bot/commit/9b3cffea2322a0f39ff5a45bc92571230cec5161))
* channelID didn't exist on !befriendlier usage ([80259a0](https://github.com/KararTY/BeFriendlier-Bot/commit/80259a0801947a3d83b88223c29906c75a23ab21))
* Check user cooldown before channel cooldown. ([5096943](https://github.com/KararTY/BeFriendlier-Bot/commit/50969439b60d9c0faf1f0a4a7a126c17aa125428))
* Don't ping creator. ([30dc306](https://github.com/KararTY/BeFriendlier-Bot/commit/30dc3062cc128c19b95aa8bd02fd19152ec0f8e6))
* don't use nullish coalescing ([233e0ae](https://github.com/KararTY/BeFriendlier-Bot/commit/233e0ae867b187c16df369595c7af2464f7b3a8b))
* Filtration logic === -> !== ([78644c7](https://github.com/KararTY/BeFriendlier-Bot/commit/78644c7d483d154fea235c10260a2334da558c93))
* Horoscopes are long, return first sentence. ([0d8f4c7](https://github.com/KararTY/BeFriendlier-Bot/commit/0d8f4c7ba06cf22865b0062cba6bac667d9eba77))
* Ignore pnpm-lock. ([07c7b15](https://github.com/KararTY/BeFriendlier-Bot/commit/07c7b1543f4835a35ecf4d779fe0e835b2ff675c))
* Initiate horoscopes with empty array. ([a8c0d50](https://github.com/KararTY/BeFriendlier-Bot/commit/a8c0d50ea2afc25de2036bc283030699836a345b))
* join -> leave ([60e50eb](https://github.com/KararTY/BeFriendlier-Bot/commit/60e50eb8b1ecca1017f52e48f27b10ae2268a911))
* Make sure commandFiles only reads js files. ([d0baa2b](https://github.com/KararTY/BeFriendlier-Bot/commit/d0baa2b32fd8ecee43aa93367d611aa4147f5bff))
* Make sure commands can be done by non-admins. ([f99817b](https://github.com/KararTY/BeFriendlier-Bot/commit/f99817b7a2ea3f6608ecee110882843400f3873b))
* Make sure multiple horoscopes can exist. ([99f6473](https://github.com/KararTY/BeFriendlier-Bot/commit/99f64730c428d5209f0b467b5429a27d90d1fdf1))
* Make sure TAKEABREAK messages have full info. ([5f52d3f](https://github.com/KararTY/BeFriendlier-Bot/commit/5f52d3fd18301254e5c73de8bc723da52291ae8a))
* Make sure the horoscope directory is created. ([75072bc](https://github.com/KararTY/BeFriendlier-Bot/commit/75072bca06ba034a14f532c06ba42e539a845ef3))
* Make sure the horoscopes are in homedir. ([f8f0f5f](https://github.com/KararTY/BeFriendlier-Bot/commit/f8f0f5fb74ebad18f444e90b4379a08354abaa47))
* Make sure Twitch.id is defined. ([6ef5143](https://github.com/KararTY/BeFriendlier-Bot/commit/6ef514354f508fc1076521add81e3a9234d16c7d))
* More verbosity. ([c1b24e3](https://github.com/KararTY/BeFriendlier-Bot/commit/c1b24e336a15f1e50405da177b3a01b19368199b))
* Move functions around. ([0de8411](https://github.com/KararTY/BeFriendlier-Bot/commit/0de8411a5498b72f4659aee028257a8a483edeeb))
* Possible fix for help message. ([e55eb36](https://github.com/KararTY/BeFriendlier-Bot/commit/e55eb36da42c7dad729aa953078ecdba55d6c6d5))
* Properly parse %prefix% & %s%. ([a0d6c66](https://github.com/KararTY/BeFriendlier-Bot/commit/a0d6c66cfb96ebf83468fec5e3da6d9b432a1316))
* Redundant, handled by web now. ([996bbc2](https://github.com/KararTY/BeFriendlier-Bot/commit/996bbc29853d8bb50a8f81c41cc4f4c2ab3e642a))
* Refactor addInvisible suffix to all channels. ([da36ab3](https://github.com/KararTY/BeFriendlier-Bot/commit/da36ab39d0ed59e4fd5710218d4d370cb780d47c))
* Refactor adminOnly commands. ([feb3817](https://github.com/KararTY/BeFriendlier-Bot/commit/feb3817d0e7bf9cbf7f27bc1b9caa2d3c9ed3b46))
* Refactor cooldown, add 15s user cooldown. ([ad2fec3](https://github.com/KararTY/BeFriendlier-Bot/commit/ad2fec3aecda334ba18237042635f3d24c1a05dc))
* Refactor error handling. ([8339702](https://github.com/KararTY/BeFriendlier-Bot/commit/8339702aae18b9c294cd0c44fe1dde4651c6d760))
* Refactor message filter to BioHandler. ([88f032f](https://github.com/KararTY/BeFriendlier-Bot/commit/88f032f66490bd9bf385421c376b6508a298bc03))
* Refactor PRIVMSG handler move to own function ([44f3261](https://github.com/KararTY/BeFriendlier-Bot/commit/44f32614608f3f74637ae2a5161ddb6f3b041b92))
* Rejoin channels on new Token. ([3b5a530](https://github.com/KararTY/BeFriendlier-Bot/commit/3b5a5305dd974229937e7e6e566fe323ffeb2e0d))
* Removed redundant substring() usage. ([fe55f92](https://github.com/KararTY/BeFriendlier-Bot/commit/fe55f9250435b9979c93928d9729ba38b83b505a))
* Removed unnecessary env variables. ([c94205c](https://github.com/KararTY/BeFriendlier-Bot/commit/c94205c48084df8b005f81ebb464f647a363b95c))
* Renamed errors for clarity. ([e263fbc](https://github.com/KararTY/BeFriendlier-Bot/commit/e263fbcc1f61dec65877984f0272116295c1cd5e))
* Reply if bio is too short/long. ([3bbc6ea](https://github.com/KararTY/BeFriendlier-Bot/commit/3bbc6ea6eb952837f6f2820d4ca43f14dfac6dd3))
* Revert change, create source maps. ([1206105](https://github.com/KararTY/BeFriendlier-Bot/commit/1206105e6016499cb55635fda22de408c555d87d))
* Revert fe55f9250435b9979c93928d9729ba38b83b505a , introduced a bug. ([1410574](https://github.com/KararTY/BeFriendlier-Bot/commit/1410574a8b1facbbc993fae3760748488ab7c1fa))
* Revert some strict checks. ([12016a3](https://github.com/KararTY/BeFriendlier-Bot/commit/12016a36d4db129096ea17d538bb0d544d0895aa))
* Simplify @[@help](https://github.com/help) bot command. ([abb0dfc](https://github.com/KararTY/BeFriendlier-Bot/commit/abb0dfc332c770c6fad8dbe26a87d8a0b75e41d5))
* Update build script ([9dc4cd1](https://github.com/KararTY/BeFriendlier-Bot/commit/9dc4cd155381fce4e038d5102f242015d80e27d6))
* Use new befriendlier-shared's EMOTES. ([7d1be53](https://github.com/KararTY/BeFriendlier-Bot/commit/7d1be532e8339b6d7a071234cdd91c9295361955))
* User cooldowns. ([96f2e28](https://github.com/KararTY/BeFriendlier-Bot/commit/96f2e28b338b67d8a11f2ea79bcc475beab170e6))
* words[] in Handlers now only return args. ([6768054](https://github.com/KararTY/BeFriendlier-Bot/commit/6768054c9799e46b7534eb74eb823b924de9ea01))
* **NPM:** Change build-bot to build. ([23f5e2a](https://github.com/KararTY/BeFriendlier-Bot/commit/23f5e2a9e3635f8ec30a7943c6ee6ef225a6b871))

### 0.0.1 (2020-08-10)


### Features

* Foundations for websocket client. ([8d29038](https://github.com/KararTY/BeFriendlier-Bot/commit/8d29038ea2592d374797b231354f0148758a7095))
* The big #$!? update ([41d620c](https://github.com/KararTY/BeFriendlier-Bot/commit/41d620ca924714b5d523243465bd4451ddb75c12))
* uWebsockets work-in-progress stalled for now ([b9169c5](https://github.com/KararTY/BeFriendlier-Bot/commit/b9169c5b6aa7a74c0aa5a1fe0d1e9b283111ac02))
