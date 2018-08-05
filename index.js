/**
 * GURU SUBSCRIPTIONS
 * Made by PotatOS
 * A Discord bot that aids in the process of KA Gurus' subscription system
 * Users can subscribe to and unsubscribe from creators at will in order to see the creator's subscription channel
 * Guru Staff can easily edit the creators using commands
 * 
 * COMMANDS - Everyone can use
 * botinfo            - Get information about the bot
 * help               - See a list of commands or information about a command
 * subscribe          - Subscribe to a KA Creator to view their subscription channel
 * subscribers        - View all of your subscribers
 * subscriptions      - View all KA Creators
 * uptime             - See how long the bot has been running
 * 
 * COMMANDS - Staff only
 * add         - Set up a channel and role for a KA Creator
 * clear       - Clear messages
 * edit        - Edit a KA Creator's name
 * remove      - Remove a KA Creator role
 * say         - Say a message through the bot
 * 
 * TO DO
 * Redo to comments to accurately fit what's happening in the code
 * Generalize better by removing the need to constantly change names based on what changes in the server
 * ??? KA Gurus is dying but this bot needs to stay alive for contingency reasons
 */

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

// Information about each KA Creator
let creators = {};
client.query("SELECT * FROM creators", (err, res) => {
  res.rows.forEach(r => {
    creators[r.id] = {
      name: r.name,
      role: r.role,
      channel: r.channel
    }
  })
})

bot.on("ready", async () => { // When the bot is loaded
  console.log(`${bot.user.username} is online in ${bot.guilds.size} servers!`);
  bot.user.setActivity(`${botconfig.prefix}help`);
});

let uptime = 0;
setInterval(e => uptime++, 1);

// All error utilities
const errors = {
  log: (bot, message, error) => {
    let logChannel = bot.channels.find("id", "446758267490926592");
    let errorMessage = "";
    for (var i = 0; i < Math.min(error.stack.toString().length, 1018); i++) {
        errorMessage += error.stack.toString()[i];
    }

    let logEmbed = new Discord.RichEmbed()
    .setDescription(`Error in ${message.channel.toString()} (${message.guild.name})`)
    .setColor("f04747")
    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
    .addField("Message", message.content)
    .addField("Error", "```" + errorMessage + "```")
    .setTimestamp(message.createdAt)
    
    logChannel.send(logEmbed);
    message.channel.send("Uh oh, it looks like an error has occurred! A log has been sent and will be investigated shortly.");
  },
  noPerms: (message, perm) => {
    message.delete();
    
    let permEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle("NO PERMISSIONS")
    .setColor("f04747")
    .addField("Message Sent", message.content)
    .addField("Insufficient Permission", perm);

    message.channel.send(permEmbed).then(m => m.delete(10000));
  },
  usage: (message, command, info) => {
    message.delete();

    let botconfig = require("./botconfig.json");

    let usageEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle("Incorrect Usage")
    .setColor("f04747")
    .addField("Message Sent", message.content)
    .addField("Usage", "`" + `${botconfig.prefix}${command.name}${command.usage}` + "`", true)
    .addField("Info", info, true);

    message.channel.send(usageEmbed).then(msg => msg.delete(60000));
  },
  other: (message, info) => {
    message.delete();

    let embed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle("ERROR")
    .setColor("f04747")
    .addField("Message Sent", message.content)
    .addField("Info", info);

    message.channel.send(embed).then(msg => msg.delete(30000));
  }
}

// All bot commands
let commands = {
  add: {
    name: "add",
    desc: "Set up a channel and role for a KA Creator",
    usage: " [user] [name]",
    perms: "Staff",
    run: async (message, args) => {
      let guardianRole = message.guild.roles.find(`name`, "Guru Staff");
      if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Staff");
      
      if (!args[0]) return errors.usage(message, commands.add, "Specify a user to make a KA Creator");
      
      let KAUser = message.mentions.members.first();
      if (!KAUser) KAUser = args[0];
      message.guild.members.forEach(m => {
        if (m.id === args[0]) KAUser = m;
      })
      if (KAUser === args[0]) return errors.usage(message, commands.add, `${args[0]} is not a member of this server`);
      
      if (creators[KAUser.id]) return errors.other(message, "That user is already a KA Creator");
      
      /*let kaCreatorRole = message.guild.roles.find(`name`, "Creator");
      KAUser.addRole(kaCreatorRole.id);*/
      
      let KAname = args.slice(1).join(" ");
      if (!KAname) return errors.usage(message, commands.add, "Specify a name for the channel and role");
      
      let creatorRole = message.guild.roles.find(`name`, KAname);
      if (!creatorRole) {
        try {
          creatorRole = await message.guild.createRole({
            name: KAname
          })
        } catch(e) {
          errors.log(bot, message, e);
        }
      }
      
      let everyoneRole = message.guild.defaultRole;
      let creatorChannel = message.guild.channels.find(`name`, KAname.split(" ").join("-").toLowerCase());
      
      if (!creatorChannel) {
        try {
          creatorChannel = await message.guild.createChannel(KAname, "text", [{
            id: KAUser.id,
            deny: ["CREATE_INSTANT_INVITE"],
            allow: ["MANAGE_CHANNELS", "MANAGE_ROLES_OR_PERMISSIONS", "MANAGE_WEBHOOKS", "READ_MESSAGES", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "ADD_REACTIONS"]
          }, {
            id: creatorRole.id,
            deny: ["CREATE_INSTANT_INVITE"],
            allow: ["READ_MESSAGES", "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "ADD_REACTIONS"]
          }, {
            id: everyoneRole.id,
            deny: ["READ_MESSAGES", "SEND_MESSAGES"]
          }], `KA Subscription channel for ${KAname}`);
        } catch(e) {
          errors.log(bot, message, e);
        }
      }
    
      let subCategory = message.guild.channels.find(`name`, "Subscriptions");
      await creatorChannel.setParent(subCategory.id);
    
      KAUser.addRole(creatorRole.id);
    
      try {
        await KAUser.send(`Congratulations, you have been given your very own KA Subscription channel in ${message.guild.name}! You can edit it as you wish, and give people updates about what you're working on. Check it out over at <#${creatorChannel.id}>. Enjoy!`);
      } catch(e) {
        message.channel.send(`Congratulations ${KAUser}, you have been given your very own KA Subscription channel! You can edit it as you wish, and give people updates about what you're working on. Check it out over at <#${creatorChannel.id}>. Enjoy!`);
      }
    
      creators[KAUser.id] = {
        name: KAname,
        role: creatorRole.id,
        channel: creatorChannel.id
      }
    
      message.channel.send("KA Creator: `" + KAname + "` successfully added. Make sure to change the role color if necessary and alphabetically sort the role and channel.");
    }
  },
  botinfo: {
    name: "botinfo",
    desc: "Get information about the bot",
    run: (message, args) => {
      let bIcon = bot.user.displayAvatarURL;
      let botEmbed = new Discord.RichEmbed()
      .setDescription("Bot Information")
      .setThumbnail(bIcon)
      .addField("Bot Name", bot.user.username)
      .addField("Created On", bot.user.createdAt)
      .addField("Created By", "<@286664522083729409>")
      .addField("Servers", bot.guilds.size);

      return message.channel.send(botEmbed);
    }
  },
  clear: {
    name: "clear",
    desc: "Clear messages",
    group: "Moderation",
    usage: " [number of messages] (equals/contains/author/bots) (text/author)",
    perms: "Staff",
    info: "Equals: Clears messages that match text\nContains: Clears messages containing text\nAuthor: Clears messages sent by a certain user\nBots: Clears messages sent by bots",
    run: async (message, args) => {
      let guardianRole = message.guild.roles.find("name", "Guru Staff")
      if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Manage Messages");

      if (!parseInt(args[0])) return errors.usage(message, commands.clear, "Specify a number of messages.");

      let limitLeft = parseInt(args[0]) + 1;
      let cleared = 0;

      if (!args[1]) {
          message.delete().catch();

          while (limitLeft > 0) {
              let messages = await message.channel.fetchMessages({limit: Math.min(limitLeft, 100)});
      
              limitLeft -= messages.size;
              cleared += messages.size;
              if (messages.size === 0) limitLeft = 0;
              await message.channel.bulkDelete(messages);
          }
          return message.channel.send(`Cleared ${cleared - 1} messages.`).then(msg => msg.delete(3000));
      }

      if (args[1] !== "contains" && args[1] !== "equals" && args[1] !== "author" && args[1] !== "bots") return errors.usage(message, commands.clear, "Invalid type of messages.");

      let requirement = args.slice(2).join(" ");
      if (args[1] !== "bots") {
          if (!requirement) return errors.usage(message, commands.clear, "Specify a requirement");
      }

      message.delete().catch();
      
      while (limitLeft > 0) {
          let messages = await message.channel.fetchMessages({limit: Math.min(limitLeft, 100)});
          if (args[1] === "equals") {
              messages = messages.filter(message => message.content.toLowerCase() === requirement.toLowerCase());
          }
          if (args[1] === "contains") {
              messages = messages.filter(message => message.content.toLowerCase().indexOf(requirement.toLowerCase()) >= 0);
          }
          if (args[1] === "author") {
              messages = messages.filter(m => `<@${m.author.id}>` === requirement || `<@!${m.author.id}>` === requirement || m.author.username === requirement);
          }
          if (args[1] === "bots") {
              messages = messages.filter(m => m.author.bot);
          }

          limitLeft -= messages.size;
          cleared += messages.size;
          if (messages.size === 0) limitLeft = 0;
          await message.channel.bulkDelete(messages);
      }
      message.channel.send(`Cleared ${cleared} messages.`).then(msg => msg.delete(3000));
    }
  },
  edit: {
    name: "edit",
    desc: "Edit a KA Creator's name",
    usage: " [user] [name]",
    perms: "Staff",
    run: (message, args) => {
      let guardianRole = message.guild.roles.find("name", "Guru Staff");
      if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Staff");

      if (!args[0]) return errors.usage(message, commands.edit, "Specify a user to edit")
      let editCreator = bot.users.find("id", args[0]) || message.mentions.members.first();
      editCreator = editCreator.user || editCreator;

      if (!editCreator) return errors.usage(message, commands.editcreator, "Specify a valid user");
      if (!creators[editCreator.id]) return errors.usage(message, commands.edit, "User is not a KA Creator");

      if (!args[1]) return errors.usage(message, commands.edit, "Specify a name to change to");
      let oldName = creators[editCreator.id].name;
      let newName = args.slice(1).join(" ");

      let creatorRole = message.guild.roles.find("id", creators[editCreator.id].role);
      let creatorChannel = message.guild.channels.find("id", creators[editCreator.id].channel);

      creators[editCreator.id].name = newName;
      creatorRole.edit({name: newName});
      creatorChannel.edit({name: newName});

      message.channel.send(`Creator successfully renamed from \`${oldName}\` to \`${newName}\``);
    }
  },
  help: {
    name: "help",
    desc: "See a list of commands or information about a command",
    usage: " (command)",
    run: async (message, args) => {
      let guardianRole = message.guild.roles.find(`name`, "Guru Staff");

      let arg = args.slice(0).join(" ");
      for (let i in commands) {
        if (arg.toLowerCase() === commands[i].name.toLowerCase()) {
          let cmdEmbed = new Discord.RichEmbed()
          .setDescription(`**${commands[i].name}** command help`)
          .addField("Usage \`[required] (optional)\`", "`" + `${botconfig.prefix}${commands[i].name}${(commands[i].usage || "")}` + "`")
          .addField("Description", commands[i].desc)
          if (commands[i].perms) cmdEmbed.addField("Required Permission", commands[i].perms)
          if (commands[i].info) cmdEmbed.addField("More Information", commands[i].info)
          .setFooter(`To view all commands, type "${botconfig.prefix}help (page)"`);

          return message.channel.send(cmdEmbed);
        }
      }

      let helpEmbed = new Discord.RichEmbed()
      .setDescription("List of commands")
      .addField(`Prefix:`, botconfig.prefix)
      .setFooter(`Type "${botconfig.prefix}help (command)" to view more information about a command`)
      
      for (let i in commands) {
        if ((commands[i].perms !== "Staff" || message.member.roles.has(guardianRole.id))) helpEmbed.addField(commands[i].name, commands[i].desc)
      }

      try {
        await message.author.send(helpEmbed);
        message.react("👍");
        message.channel.send("Help page has been sent through DM");
      } catch (e) {
        message.channel.send(helpEmbed);
      }
    }
  },
  remove: {
    name: "remove",
    desc: "Remove a KA Creator role",
    usage: " [creator]",
    perms: "Staff",
    run: async (message, args) => {
      let guardianRole = message.guild.roles.find(`name`, "Guru Staff");
      if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Staff");

      let subName = args.slice(0).join(" ");
      if (!subName) return errors.usage(message, commands.remove, "No creator specified");

      if (Object.keys(creators).length <= 0) return errors.other(message, "There are currently no KA Creator roles");

      let sub = -1;
      for (let i in creators) {
        if (creators[i].name === subName) sub = i;
      }
      if (sub === -1) return errors.usage(message, commands.remove, `${subName} is not a KA Creator`);

      delete creators[sub];
      
      let subRole = message.guild.roles.find(`name`, subName);
      await subRole.delete();

      message.channel.send("KA Creator: `" + subName + "` successfully removed");
    }
  },
  say: {
    name: "say",
    desc: "Say a message through the bot",
    usage: " [message]",
    perms: "Staff",
    run: (message, args) => {
      let guardianRole = message.guild.roles.find("name", "Guru Staff");
      if (!message.member.roles.has(guardianRole.id)) return;

      let sayMessage = args.join(" ");
      if (!sayMessage) return message.channel.send("Specify a message");

      message.delete().then(message.channel.send(sayMessage));
    }
  },
  subscribe: {
    name: "subscribe",
    desc: "Subscribe to a KA Creator to view their subscription channel",
    usage: " [creator]",
    run: (message, args) => {
      let commandChannel = message.guild.channels.find(`name`, "bots");
      if (message.channel.name !== "bots") return errors.other(message, `Subscribe in ${commandChannel}`);

      if (Object.keys(creators).length <= 0) return errors.other(message, "There are currently no KA Creator roles");

      if (!args[0]) return errors.usage(message, commands.subscribe, "Choose a creator to subscribe to\nUse the subscriptions command to view all creators");

      let creatorName = args.slice(0).join(" ");
      let name = -1;

      for (let i in creators) {
        if (creators[i].name.toLowerCase() === creatorName.toLowerCase()) name = creators[i];
      }

      if (name === -1) return errors.usage(message, commands.subscribe, `${creatorName} is not a creator role`);

      let creatorRole = message.guild.roles.find(`id`, name.role);

      if (!message.member.roles.has(creatorRole.id)) {
        message.member.addRole(creatorRole.id);

        let sEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL)
        .setColor("#67e03a")
        .addField("Subscribed", name.name);

        return message.channel.send(sEmbed);
      }

      message.member.removeRole(creatorRole.id);

      let sEmbed = new Discord.RichEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .setColor("#e34114")
      .addField("Unsubscribed", name.name);

      return message.channel.send(sEmbed);
    }
  },
  subscribers: {
    name: "subscribers",
    usage: " (user)",
    desc: "View all of your subscribers",
    info: "Only applicable for a KA Creator",
    run: (message, args) => {
      let commandChannel = message.guild.channels.find(`name`, "bots");
      if (message.channel.name !== "bots") return errors.other(message, `View subscriptions in ${commandChannel}`);
      
      if (Object.keys(creators).length <= 0) return errors.other(message, "There are currently no KA Creator roles");

      let subCreator = message.mentions.members.first();
      if (!subCreator) subCreator = args.join(" ");
      if (!subCreator) subCreator = message.author;
      
      let creator = -1;
      for (let i in creators) {
        if (i === subCreator.id || i === subCreator || (subCreator.toString() === subCreator && creators[i].name.toLowerCase() === subCreator.toLowerCase())) creator = creators[i];
      }

      if (creator === -1) return errors.noPerms(message, "User must be a KA Creator");

      let subs = [];
      message.guild.members.forEach(m => {
        m.roles.forEach(r => {
          if (r.id === creator.role) subs.push(m);
        });
      });

      let sEmbed = new Discord.RichEmbed()
      if (subs.length > 0) {
        sEmbed.setAuthor(creator.name)
        sEmbed.addField(`${subs.length} total subscribers`, subs)
      }
      else sEmbed.addField(creator.name, "No subscribers")

      message.channel.send(sEmbed);
    }
  },
  subscriptions: {
    name: "subscriptions",
    desc: "View all KA Creators",
    usage: " (page)",
    info: "How many subscribers each has",
    run: (message, args) => {
      let commandChannel = message.guild.channels.find(`name`, "bots");
      if (message.channel.name !== "bots") return errors.other(message, `View subscriptions in ${commandChannel}`);
      
      if (Object.keys(creators).length <= 0) return errors.other(message, "There are currently no KA Creator roles");

      let subscriptions = Object.values(creators).sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
      
      let subMembers = 0;
  
      let longestSubName = 0;
  
      subscriptions.forEach(c => {
        if (c.name.length > longestSubName) {
          longestSubName = c.name.length;
        }
      })
      
      let subsText = [""];
      subscriptions.forEach(i => {
        subMembers = 0;
        message.guild.members.forEach(m => {
          m.roles.forEach(r => {
            if (r.id === i.role) subMembers++;
          });
        });

        if (subsText[subsText.length - 1].length + longestSubName + 3 > 1024) subsText.push("");

        subsText[subsText.length - 1] += "`" + i.name;
        for (var j = -3; j < longestSubName - i.name.length; j++) {
          subsText[subsText.length - 1] += " ";
        }
        subsText[subsText.length - 1] += `${subMembers}\`\n`;
      })

      let page = Math.floor(parseInt(args[0]));
      if (!page || page < 1) page = 1;
      if (page > subsText.length) page = subsText.length;

      let sEmbed = new Discord.RichEmbed()
      .addField("KA Subscriptions", subsText[page - 1])
      .setFooter(`Use the subscribe command to subscribe to or unsubscribe from a KA Creator`)

      message.channel.send(sEmbed);
    }
  },
  uptime: {
    name: "uptime",
    desc: "See how long the bot has been running",
    run: (message, args) => {
      let uptimeMsg = "";

      if (uptime >= 86400000) uptimeMsg += `${Math.floor(uptime / 86400000)}d, `;
      if (uptime >= 3600000) uptimeMsg += `${Math.floor((uptime % 86400000) / 3600000)}h, `;
      if (uptime >= 60000) uptimeMsg += `${Math.floor((uptime % 3600000) / 60000)}m, `;
      uptimeMsg += `${(uptime % 60000) / 1000}s`;

      message.channel.send(`BOT UPTIME: \`${uptimeMsg}\``);
    }
  }
}

//bot.on("guildMemberAdd", async member => {if (member.user.username.toLowerCase().indexOf("oops") >= 0) member.kick(`${member.user.username} has "oops" in it, so they must be dealt with`);});

let languageFilters = ["xd", "x-d", "x d", "x.d", "x'd"];

let autoresponseCooldown = 0;
setInterval(function() {
  autoresponseCooldown--;
}, 1);

bot.on("messageUpdate", async (oldMessage, newMessage) => {
  try {
    for (var i = 0; i < languageFilters.length; i++) {
      if (newMessage.content.toLowerCase().indexOf(languageFilters[i]) >= 0) {
        if (newMessage.content.length - 20 > languageFilters[i].length && newMessage.content.toLowerCase().split(languageFilters[i]).length - 1 < newMessage.content.length / languageFilters[i].length / 3) return;
        await newMessage.delete();
      }
    }
  } catch(error) {
    errors.log(bot, newMessage, error);
  }
});

bot.on("message", message => { // When a message is sent
  if (message.author.bot) return; // Ignores the message if it is sent by a bot
  if (message.channel.type === "dm") return;
  
  // Original creators to compare with later
  let oldCreators = Object.values(creators);
  
  // Get certain parts of the message sent
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0].toLowerCase();
  let args = messageArray.slice(1);
  
  // Simplify the server's prefix into the prefix variable
  let prefix = botconfig.prefix;
  
  // If the message starts with the prefix
  if (message.content.startsWith(prefix)) {
    // If the message is a command, run the command
    for (let i in commands) {
      if (cmd.slice(prefix.length) === commands[i].name) {
        try {
          commands[i].run(message, args);
        } catch(error) {
          errors.log(bot, message, error);
        }

        // Save the creators database
        client.query("DELETE FROM creators");
        for (let i in creators) {
          client.query(`INSERT INTO creators VALUES (${i}, '${creators[i].name}', ${creators[i].role}, ${creators[i].channel})`);
        }
      }
    }
  }
  
  // Think carefully before you post in #announcements
  if (!message.member.roles.has(message.guild.roles.find("name", "Guru Staff")) && message.channel.name === "announcements") message.member.addRole(message.guild.roles.find("name", "Furry"));

  if (/https?:\/\/(www\.)?tenor\.com?/.test(message.content)) message.delete();
  if (/^[\s./…]+$/.test(message.content)) message.delete();
    
  try {
    for (var i = 0; i < languageFilters.length; i++) {
      if (message.content.toLowerCase().indexOf(languageFilters[i]) >= 0) {
        if (message.content.length - 20 > languageFilters[i].length && message.content.toLowerCase().split(languageFilters[i]).length - 1 < message.content.length / languageFilters[i].length / 3) return;
        message.delete();
      }
    }
  } catch(error) {
    errors.log(bot, message, error);
  }

  if (message.content.startsWith(`${prefix}eval`)) {
    if (message.author.id !== "286664522083729409") return;
    let code = args.slice(0).join(" ");
    try {
        eval(code);
    } catch(e) {
        message.channel.send("`" + e.toString() + "`");
    }
  }
});

// Log into the bot using the token
bot.login(process.env.BOT_TOKEN);
