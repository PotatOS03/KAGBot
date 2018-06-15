// Basic bot setup - this is what lets the bot interact with Discord
const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

// Read and write to other files in the bot folder
const fs = require("fs");

// File for the bot configuration - includes default prefix
const botconfig = require("./botconfig.json");

const { Client } = require("pg");

const client = new Client({
  connectionString: `${botconfig.connectionURL || process.env.DATABASE_URL}?ssl=true`
})
client.connect();

let users = {};
let servers = {};

client.query("SELECT * FROM users", (err, res) => {
  res.rows.forEach(u => {
    users[u.id] = {
      coins: u.coins,
      warnings: u.warnings,
      xp: u.xp,
      level: u.level
    }
  })
})
client.query("SELECT * FROM servers", (err, res) => {
  res.rows.forEach(s => {
    servers[s.id] = {
      prefix: s.prefix,
      ranks: s.ranks.split(",")
    }
  })
})

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

  let userCount = 0;
  bot.users.forEach(u => {
    if (!u.bot) userCount++;
})
bot.user.setActivity(`Serving ${userCount} users`);
});

bot.on("guildMemberAdd", async member => { // When a member joins the server
  let welcomeChannel = member.guild.channels.find(`name`, "general"); // Channel to send welcome message
  welcomeChannel.send(`${member} has joined **${member.guild.name}**! Welcome!`); // Sends a welcome message

  let userCount = 0;
  bot.users.forEach(u => {
    if (!u.bot) userCount++;
  })
  bot.user.setActivity(`Serving ${userCount} users`);
});

bot.on("guildMemberRemove", async member => { // When a member leaves the server or gets kicked
  let welcomeChannel = member.guild.channels.find(`name`, "general"); // Channel to send leave message
  welcomeChannel.send(`Goodbye, ${member} has left the server.`); // Sends a leave message

  let userCount = 0;
  bot.users.forEach(u => {
    if (!u.bot) userCount++;
  })
  bot.user.setActivity(`Serving ${userCount} users`);
});

// Setup of action log
let logChannel = "action-log";
/*bot.on("channelCreate", async channel => {
    try {
        let actionLogChannel = channel.guild.channels.find(`name`, logChannel);
    
        let logEmbed = new Discord.RichEmbed()
        .setTitle(`New ${channel.type} channel created`)
        .setColor("f04747")
        .addField("Channel", channel, true)
        .addField("Position", channel.position, true);
    
        actionLogChannel.send(logEmbed);
    } catch(e) {}
});

bot.on("channelDelete", async channel => {
    let actionLogChannel = channel.guild.channels.find(`name`, logChannel);

    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Channel deleted`)
    .setColor("f04747")
    .addField("Channel", channel.name, true)
    .addField("Position", channel.position, true);
    
    actionLogChannel.send(logEmbed);
});

bot.on("channelPinsUpdate", async (channel, time) => {
    let actionLogChannel = channel.guild.channels.find(`name`, logChannel);

    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Channel pins updated`)
    .setColor("f04747")
    .addField("Channel", channel, true)
    .addField("Time", time, true);
    
    actionLogChannel.send(logEmbed);
});

bot.on("channelUpdate", async (oldChannel, newChannel) => {
    let actionLogChannel = newChannel.guild.channels.find(`name`, logChannel);

    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Channel updated`)
    .setColor("f04747")
    .addField("Channel", newChannel);
    
    actionLogChannel.send(logEmbed);
});

bot.on("channelUpdate", async (oldChannel, newChannel) => {
    let actionLogChannel = newChannel.guild.channels.find(`name`, logChannel);

    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Channel updated`)
    .setColor("f04747")
    .addField("Channel", newChannel);
    
    actionLogChannel.send(logEmbed);
});

bot.on("emojiCreate", async emoji => {
    let actionLogChannel = emoji.guild.channels.find(`name`, logChannel);

    let logEmbed = new Discord.RichEmbed()
    .setTitle(`New emoji created`)
    .setColor("f04747")
    .addField("Emoji", emoji, true)
    .addField("Name", emoji.name, true);
    
    actionLogChannel.send(logEmbed);
});

bot.on("emojiDelete", async emoji => {
    let actionLogChannel = emoji.guild.channels.find(`name`, logChannel);

    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Emoji deleted`)
    .setColor("f04747")
    .addField("Emoji", emoji);
    
    actionLogChannel.send(logEmbed);
});

bot.on("emojiUpdate", async emoji => {
    let actionLogChannel = emoji.guild.channels.find(`name`, logChannel);

    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Emoji updated`)
    .setColor("f04747")
    .addField("Emoji", emoji, true)
    .addField("Old name", emoji.name, true);
    
    actionLogChannel.send(logEmbed);
});

bot.on("guildBanAdd", async (guild, user) => {
    let actionLogChannel = guild.channels.find(`name`, logChannel);
    
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Member banned`)
    .setColor("f04747")
    .addField("Member", `${user.username}#${user.discriminator}`);
    
    actionLogChannel.send(logEmbed);
});

bot.on("guildBanRemove", async (guild, user) => {
    let actionLogChannel = guild.channels.find(`name`, logChannel);
    
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Member unbanned`)
    .setColor("f04747")
    .addField("Member", user);
    
    actionLogChannel.send(logEmbed);
});

bot.on("guildMemberAdd", async member => {
    let actionLogChannel = member.guild.channels.find(`name`, logChannel);
    
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Member joined`)
    .setColor("f04747")
    .addField("Member", member, true)
    .addField("Account created", member.user.createdAt);
    
    actionLogChannel.send(logEmbed);
});

bot.on("guildMemberRemove", async member => {
    let actionLogChannel = member.guild.channels.find(`name`, logChannel);
    
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Member left`)
    .setColor("f04747")
    .addField("Member", member);
    
    actionLogChannel.send(logEmbed);
});

bot.on("guildMemberUpdate", async (oldMember, newMember) => {
    let actionLogChannel = newMember.guild.channels.find(`name`, logChannel);
    
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Member updated`)
    .setColor("f04747")
    .addField("Member", newMember)
    if (oldMember.nickname !== newMember.nickname) {
        logEmbed.addField("Old nickname", oldMember.nickname, true)
        .addField("New nickname", newMember.nickname, true);
    }
    
    actionLogChannel.send(logEmbed);
});

bot.on("guildUpdate", async (oldGuild, newGuild) => {
    let actionLogChannel = newGuild.channels.find(`name`, logChannel);
    
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Server updated`)
    .setColor("f04747")
    .addField("Member", member);
    
    actionLogChannel.send(logEmbed);
});

bot.on("messageDelete", async message => {
    let actionLogChannel = message.guild.channels.find(`name`, logChannel);
    
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Message deleted`)
    .setColor("f04747")
    .addField("Author", message.author, true)
    if (message.content && message.content.length <= 1024) logEmbed.addField("Message", message.content, true);
    
    actionLogChannel.send(logEmbed);
});

bot.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.content && newMessage.content) {
        let actionLogChannel = newMessage.guild.channels.find(`name`, logChannel);
        
        let logEmbed = new Discord.RichEmbed()
        .setTitle(`Message updated`)
        .setColor("f04747")
        .addField("Author", newMessage.author)
        .addField("Old message", oldMessage.content, true)
        .addField("New message", newMessage.content, true);
        
        actionLogChannel.send(logEmbed);
    }
});

bot.on("roleCreate", async role => {
    let actionLogChannel = role.guild.channels.find(`name`, logChannel);
    
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Role created`)
    .setColor("f04747")
    .addField("Role", role);
    
    actionLogChannel.send(logEmbed);
});

bot.on("roleDelete", async role => {
    let actionLogChannel = role.guild.channels.find(`name`, logChannel);

    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Role deleted`)
    .setColor("f04747")
    .addField("Role", role.name);
    
    actionLogChannel.send(logEmbed);
});

bot.on("roleUpdate", async (oldRole, newRole) => {
    let actionLogChannel = newRole.guild.channels.find(`name`, logChannel);
    
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`Role updated`)
    .setColor("f04747")
    .addField("Role", newRole);
    
    actionLogChannel.send(logEmbed);
});

bot.on("userUpdate", async (oldUser, newUser) => {
    let actionLogChannel = newUser.guild.channels.find(`name`, logChannel);
    console.log(oldUser)
    let logEmbed = new Discord.RichEmbed()
    .setTitle(`User updated`)
    .setColor("f04747")
    .addField("User", newUser)
    .addField("Old name", `${oldUser.username}#${oldUser.discriminator}`, true)
    .addField("New name", `${newUser.username}#${newUser.discriminator}`, true);
    
    actionLogChannel.send(logEmbed);
});
*/

//Star board (for later)
/*bot.on("messageReactionAdd", async (messageReaction, user) => {
  let starBoard = messageReaction.message.guild.channels.find(`name`, "star-board");
  if (!messageReaction.message.reactions.get("⭐")) return;
  if (messageReaction.message.reactions.get("⭐").count >= 1 && messageReaction.message.channel.name !== "star-board") {
    let starEmbed = new Discord.RichEmbed()
    .setColor("f04747")
    .setThumbnail(messageReaction.message.author.displayAvatarURL)
    .addField("Author", `<@${messageReaction.message.author.id}>`)
    .addField("Message", messageReaction.message.content)
    .addField("Channel", messageReaction.message.channel)
    .setTimestamp(messageReaction.message.createdAt);

    starBoard.send(starEmbed);
    messageReaction.message.clearReactions();
  }
});*/

bot.on("message", message => { // When a message is sent
  if (message.author.bot) return; // Ignores the message if it is sent by a bot

  // Get certain parts of the message sent
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0].toLowerCase();
  let args = messageArray.slice(1);

  // DM commands
  if (message.channel.type === "dm") {
    if (!message.content.startsWith(botconfig.prefix)) return;
    let commandfile = bot.commands.get(cmd.slice(botconfig.prefix.length));
    if (commandfile) {
        if (commandfile.help.dm) commandfile.dm(bot, message, args);
        else message.channel.send(`Sorry, the ${commandfile.help.name} command is disabled in DM`);
    }
    return;
  }
  
  if (!servers[message.guild.id]) servers[message.guild.id] = {
    prefix: botconfig.prefix,
    ranks: [],
  }
  
  if (!users[message.author.id]) users[message.author.id] = {
    coins: 0,
    warnings: 0,
    xp: 0,
    level: 1
  }

  let prefix = servers[message.guild.id].prefix;
  let isCommand = false;
    
  // If the message starts with the prefix
  if (message.content.startsWith(prefix)) {
    // If the message is a command, run the command
    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (commandfile) {
      fs.writeFileSync("./servers.json", JSON.stringify(servers));
      commandfile.run(bot, message, args);
      isCommand = true;
    }
  }
  
  if (!isCommand) {
    let coinAmount = Math.floor(Math.random() * 60) + 1;
    let baseAmount = Math.floor(Math.random() * 60) + 1;
    
    // Small chance that the user is awarded coins
    if (coinAmount === baseAmount) {
      users[message.author.id].coins += Math.floor(coinAmount / 3) + 1; // Give the user a random amount of coins
      // Message for when coins are added
      let coinEmbed = new Discord.RichEmbed()
      .setAuthor(message.author.username)
      .setColor("f04747")
      .addField("💸", `${Math.floor(coinAmount / 3) + 1} coins added!`)
      .addField("Total Coins", users[message.author.id].coins);
    
      message.channel.send(coinEmbed).then(msg => {msg.delete(10000)});
    }
    
    // Random amount of XP added for each message
    let xpAdd = Math.floor(Math.random() * 5) + 15;
    
    // How much XP is needed to reach the next level
    let nextLevel = Math.floor(Math.pow(users[message.author.id].level, 1.5) * 3) * 100;
    // Give the user the random amount of XP
    users[message.author.id].xp += xpAdd;
    
    // If the user has enough XP to level up
    if (nextLevel <= users[message.author.id].xp) {
      users[message.author.id].level++; // Increase their level by 1
    
      // Message to send
      let levelUp = new Discord.RichEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .setTitle("Level Up!")
      .setColor("f04747")
      .addField("New Level", users[message.author.id].level)
      .addField("Total XP", users[message.author.id].xp)
    
      message.channel.send(levelUp).then(msg => {msg.delete(10000)});
    }
    
    fs.writeFileSync("./users.json", JSON.stringify(users));
    client.query("DELETE FROM users");
    for (let i in users) {
      client.query(`INSERT INTO users VALUES (${i}, ${users[i].coins}, ${users[i].warnings}, ${users[i].xp}, ${users[i].level})`);
    }
  }

  servers = require("./servers.json");
  users = require("./users.json");

  client.query("DELETE FROM servers");
  for (let i in servers) {
    client.query(`INSERT INTO servers VALUES (${i}, '${servers[i].prefix}', '${servers[i].ranks.join(",")}')`);
  }
  client.query("DELETE FROM users");
  for (let i in users) {
    client.query(`INSERT INTO users VALUES (${i}, ${users[i].coins}, ${users[i].warnings}, ${users[i].xp}, ${users[i].level})`);
  }
});

// Log into the bot using the token
bot.login(process.env.BOT_TOKEN);
