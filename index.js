// Basic bot setup - this is what lets the bot interact with Discord
const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

// Read and write to other files in the bot folder
const fs = require("fs");

// File for the bot configuration - includes default prefix
const botconfig = require("./botconfig.json");

// Setup of all commands in the commands folder
fs.readdir("./commands", (err, files) => {
  if (err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if (jsfile.length <= 0) {
    console.log("Couldn't find commands.");
    return; // If no commands exist in the folder
  }
  
  jsfile.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    bot.commands.set(props.help.name, props);
    console.log(`${f} loaded!`);
  });
});

bot.on("ready", async () => { // When the bot is loaded
  console.log(`${bot.user.username} is online in ${bot.guilds.size} servers!`);
  bot.user.setActivity(`${botconfig.prefix}help`);
});

bot.on("message", async message => { // When a message is sent
  if (message.author.bot) return; // Ignores the message if it is sent by a bot
  if (message.channel.type === "dm") return;

  // Get certain parts of the message sent
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0].toLowerCase();
  let args = messageArray.slice(1);
  
  // Simplify the server's prefix into the prefix variable
  let prefix = botconfig.prefix;
  
  // If the message doesn't start with the prefix
  if (!message.content.startsWith(prefix)) return;

  // If the message is a command, run the command
  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if (commandfile) return commandfile.run(bot, message, args);
});

// Log into the bot using the token
bot.login(process.env.BOT_TOKEN);
