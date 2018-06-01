// Basic bot setup - this is what lets the bot interact with Discord
const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

// Read and write to other files in the bot folder
const fs = require("fs");

// File for the bot configuration - includes default prefix
const botconfig = require("./botconfig.json");
// File for running errors
const errors = require("./utilities/errors.js");

bot.on("ready", async () => { // When the bot is loaded
  console.log(`${bot.user.username} is online in ${bot.guilds.size} servers!`);

  let PotatOS = bot.users.find(`id`, "286664522083729409");
  PotatOS.send("Bot reloaded!");
  bot.user.setActivity(`${botconfig.prefix}help`);
});

// File for all KA Creators
let kaCreators = require("./kacreators.json");

let uptime = 0;
setInterval(e => uptime++, 1);

// All bot commands
let commands = {
  addcreator: {
    name: "addcreator",
    desc: "Set up a channel and role for a KA Creator",
    usage: " [user] [name]",
    perms: "Guardian",
    run: async (message, args) => {
        let guardianRole = message.guild.roles.find(`name`, "Guardian");
        if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Guardian");
        
        if (!args[0]) return errors.usage(message, commands.addcreator, "Specify a user to make a KA Creator");
        
        let KAUser = message.mentions.members.first();
        if (!KAUser) KAUser = args[0];
        message.guild.members.forEach(m => {
            if (m.id === args[0]) KAUser = m;
        })
        if (KAUser === args[0]) return errors.usage(message, commands.addcreator, `${args[0]} is not a member of this server`);
        
        if (!kaCreators.creators) {
            kaCreators = {
                creators: {}
            }
        }
        if (kaCreators.creators[KAUser.id]) return errors.other(message, "That user is already a KA Creator");
        
        let kaCreatorRole = message.guild.roles.find(`name`, "KA Creator");
        KAUser.addRole(kaCreatorRole.id);
        
        let KAname = args.slice(1).join(" ");
        if (!KAname) return errors.usage(message, commands.addcreator, "Specify a name for the channel and role");
        
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
        
        let everyoneRole = message.guild.roles.find(`name`, "@everyone")
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
        creatorChannel.setParent(subCategory.id);
    
        KAUser.addRole(creatorRole.id);
    
        try {
            await KAUser.send(`Congratulations, you have been given your very own KA Subscription channel in ${message.guild.name}! You can edit it as you wish, and give people updates about what you're working on. Check it out over at <#${creatorChannel.id}>. Enjoy!`);
        } catch(e) {
            message.channel.send(`Congratulations ${KAUser}, you have been given your very own KA Subscription channel! You can edit it as you wish, and give people updates about what you're working on. Check it out over at <#${creatorChannel.id}>. Enjoy!`);
        }
    
        kaCreators.creators[KAUser.id] = {
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
  help: {
    name: "help",
    desc: "See a list of commands or information about a command",
    usage: " (command)",
    run: async (message, args) => {
        let guardianRole = message.guild.roles.find(`name`, "Guardian");

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
            if ((commands[i].perms !== "Guardian" || message.member.roles.has(guardianRole.id))) helpEmbed.addField(commands[i].name, commands[i].desc)
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
  removecreator: {
    name: "removecreator",
    desc: "Remove a KA Creator role",
    usage: " [creator]",
    perms: "Guardian",
    run: (message, args) => {
        let guardianRole = message.guild.roles.find(`name`, "Guardian");
        if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Guardian");

        let subName = args.slice(0).join(" ");
        if (!subName) return errors.usage(message, commands.removecreator, "No creator specified");

        if (!kaCreators.creators || Object.keys(kaCreators.creators).length <= 0) return errors.other(message, "There are currently no KA Creator roles");

        let sub = -1;
        for (let i in kaCreators.creators) {
            if (kaCreators.creators[i].name === subName) sub = i;
        }
        if (sub === -1) return errors.usage(message, commands.removecreator, `${subName} is not a KA Creator`);

        delete kaCreators.creators[sub];
        
        let subRole = message.guild.roles.find(`name`, subName);
        subRole.delete();

        message.channel.send("KA Creator: `" + subName + "` successfully removed");
    }
  },
  subscribe: {
    name: "subscribe",
    desc: "Subscribe to a KA Creator to view their subscription channel",
    usage: " [creator]",
    run: (message, args) => {
        let commandChannel = message.guild.channels.find(`name`, "commands");
        if (message.channel.name !== "commands") return errors.other(message, `Subscribe in ${commandChannel}`);

        if (!kaCreators.creators || Object.keys(kaCreators.creators).length <= 0) return errors.other(message, "There are currently no KA Creator roles");

        if (!args[0]) return errors.usage(message, commands.subscribe, "Choose a creator to subscribe to\nUse the subscriptions command to view all creators");

        let creatorName = args.slice(0).join(" ");
        let name = -1;

        for (let i in kaCreators.creators) {
            if (kaCreators.creators[i].name.toLowerCase() === creatorName.toLowerCase()) name = kaCreators.creators[i];
        }

        if (name === -1) return errors.usage(message, commands.subscribe, `${creatorName} is not a creator role`);

        let creatorRole = message.guild.roles.find(`id`, name.role);

        if (!message.member.roles.has(creatorRole.id)) {
            message.member.addRole(creatorRole.id);

            let sEmbed = new Discord.RichEmbed()
            .setAuthor(message.author.username)
            .addField("Subscribed", name.name);

            return message.channel.send(sEmbed);
        }

        message.member.removeRole(creatorRole.id);

        let sEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.username)
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
        let commandChannel = message.guild.channels.find(`name`, "commands");
        if (message.channel.name !== "commands") return errors.other(message, `View subscriptions in ${commandChannel}`);
        
        if (!kaCreators.creators || Object.keys(kaCreators.creators).length <= 0) return errors.other(message, "There are currently no KA Creator roles");

        let subCreator = message.mentions.members.first();
        if (!subCreator) subCreator = args.join(" ");
        if (!subCreator) subCreator = message.author;
        
        let creator = -1;
        for (let i in kaCreators.creators) {
            if (i === subCreator.id || i === subCreator || (subCreator.toString() === subCreator && kaCreators.creators[i].name.toLowerCase() === subCreator.toLowerCase())) creator = kaCreators.creators[i];
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
        let commandChannel = message.guild.channels.find(`name`, "commands");
        if (message.channel.name !== "commands") return errors.other(message, `View subscriptions in ${commandChannel}`);
        
        if (!kaCreators.creators || Object.keys(kaCreators.creators).length <= 0) return errors.other(message, "There are currently no KA Creator roles");

        let subscriptions = Object.values(kaCreators.creators).sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        
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
  },
  test: {
      name: "test",
      run: (message, args) => {
          let logChannel = bot.channels.find("id", "446758267490926592");
          bot.users.forEach(u => {
            logChannel.send(`\`${u.username}#${u.discriminator}\` <@${u.id}> created at: **${u.createdAt.toString()}**`);
          })
      }
  }
}

//bot.on("guildMemberAdd", async member => {if (member.user.username.toLowerCase().indexOf("oops") >= 0) member.kick(`${member.user.username} has "oops" in it, so they must be dealt with`);});

bot.on("message", async message => { // When a message is sent
  if (message.author.bot) return; // Ignores the message if it is sent by a bot
  if (message.channel.type === "dm") return;
  
  // Original kacreators file to compare with later
  let oldKaCreators = fs.readFileSync("./kacreators.json", {encoding: "UTF-8"});
  
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
          errors.log(bot, message, error)
        }
      }
    }
  }
  
  if (JSON.stringify(kaCreators) !== oldKaCreators) {
    let logChannel = bot.channels.find("id", "446758267490926592");
    
    let logCreators = [];
    for (let i = 0; i < JSON.stringify(kaCreators).length; i += 2000) logChannel.send(JSON.stringify(kaCreators).substr(i, i + 2000));
    fs.writeFileSync("./kacreators.json", JSON.stringify(kaCreators));
  }
  
  // Fun language filter stuff - you won't regret it

  if (/https?:\/\/(www\.)?tenor\.com?/.test(message.content)) message.delete();
  if (/^[\s./…]+$/.test(message.content)) message.delete();

  let content = message.content.split("");
  content.splice(message.content.toLowerCase().indexOf("kacc"), 4, "ew");
  if (message.content.toLowerCase().indexOf("kacc") >= 0) message.channel.send(content.join(""));
  else if (message.channel.name !== "chat" && message.channel.id !== "421434381635289090") {
    if (message.content.indexOf("😉") >= 0) message.channel.send(message.content.replace(/\ud83d\ude09/g, () => `;${"WINK".split``.sort(() => Math.random() - 0.5).join``};`));
    else if (message.content.toLowerCase().indexOf("oops") >= 0) message.channel.send("<:oops:451813761481965568>");
  }

  let languageFilters = ["xd"];
    
  try {
    for (var i = 0; i < languageFilters.length; i++) {
      if (message.content.toLowerCase().indexOf(languageFilters[i]) >= 0) {
        if (message.content.length - 20 > languageFilters[i].length && message.content.toLowerCase().split(languageFilters[i]).length - 1 < message.content.length / languageFilters[i].length / 3) return;
        await message.delete();
      }
    }
  } catch(error) {
    errors.log(bot, message, error);
  }

  if (message.content.startsWith(`${prefix}eval`)) {
    if (message.author.id !== "286664522083729409") return;
    let code = args.slice(0).join(" ");
    try {
        await eval(code);
    } catch(e) {
        message.channel.send("`" + e.toString() + "`");
    }
  }
});

// Log into the bot using the token
bot.login(process.env.BOT_TOKEN);
