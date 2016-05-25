var Botkit = require('botkit'),
  botCtrl = Botkit.slackbot({
    debug: false
  }),
  greetings = ['Yo!', 'Howdy!', 'Sup?', 'Whazzup!', 'G\'day mate!', 'Hiya!', 'A-yo!', 'How\'s it hanging', 'Howzit!',
    'Wassap!', 'Wassup!', 'What it be!', 'What it do!', 'What\'s crack-a-lackin\'!', 'What\'s cracking!',
    'What\'s crackin\'!', 'What\'s shaking!', 'What\'s shaking bacon!', 'Yello!', 'Yo!', 'What\'s the dizzle!',
    'What\'s the haps!', 'What\'s up!', 'What up!', 'Wussup!'
  ],
  _ = require('underscore'),
  randomGreeting = function() {
    return greetings[_.random(0, 24)];
  };

module.exports = {
  spawn: function(slackToken) {
    var opsBot = botCtrl.spawn({
      token: slackToken
    });
    return opsBot;
  },
  start: function(opsBot) {
    opsBot.startRTM(function(err, bot, payload) {
      if (err) {
        console.error('Connection to slack failed');
      } else {
        console.log('Connection to slack established');
      }
    });
  },
  join: function(opsBot) {
    opsBot.botkit.on('bot_group_join', function(bot, message) {
      bot.reply(message, {
        'as_user': true,
        'attachments': [{
          'title': randomGreeting(),
          'text': 'I\'m OpsBot. Your one stop bot for your KE ops requests. ' +
            'Really cool of you to invite me here, thanks. But I ain\'t meant to be here. ' +
            'DM me if you\'d like to talk.',
          'color': '#28bbdb'
        }]
      });
    });
  },
  close: function(opsBot) {
    opsBot.closeRTM();
  },
  destroy: function(opsBot) {
    opsBot.destroy.bind(opsBot);
  },
  commands: {
    showHelp: function() {
      botCtrl.hears(['help'], 'direct_message,direct_mention,mention, ambient',
        function(bot, message) {
          bot.reply(message, {
            'as_user': true,
            'text': '*_Available Commands:_*\n' +
              '>>>' +
              '*1. help* \n\tDisplay help menu\n' +
              '*2. items* \n\tList items available from Ops Dept. with item id and name\n' +
              '*3. request <itemId> <quantity>* \n\tRequest particular quantity ' +
              'of an item with specified itemId'
          });
        });
    },
    listItems: function() {
      botCtrl.hears(['items'], 'direct_message,direct_mention,mention, ambient',
        function(bot, message) {
          bot.reply(message, availableRoomsData);
        });
    },
    request: function() {
      botCtrl.hears(['request'], 'direct_message,direct_mention,mention, ambient',
        function(bot, message) {
          bot.reply(message, availableRoomsData);
        });
    },
    default: function() {
      botCtrl.hears([/^((?!request|help|items).)*$/], 'direct_message,direct_mention,mention, ambient',
        function(bot, message) {
          bot.reply(message, {
            'as_user': true,
            'attachments': [{
              'title': randomGreeting(),
              'text': 'I\'m OpsBot. Your one stop bot for your KE ops requests. ' +
                'You entered an invalid command. ' +
                'To see a list of commands I can respond to, just type help.',
              'color': '#28bbdb'
            }]
          });
        });
    }
  },
  register: function() {
    module.exports.commands.request();
    module.exports.commands.default();
    module.exports.commands.showHelp();
    module.exports.commands.listItems();
  }
};
