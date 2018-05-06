const Discord = require("discord.js");
const fs = require("fs");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let guardianRole = message.guild.roles.find(`name`, "Guardian");
    if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Guardian");

    if (!args[0]) return errors.usage(message, "addcreator", "Specify a user to make a KA Creator");

    let KAUser = message.mentions.members.first();
    if (!KAUser) return errors.usage(message, "addcreator", `${args[0]} is not a member of this server`);

    let kaCreatorRole = message.guild.roles.find(`name`, "KA Creator");
    await (KAUser.addRole(kaCreatorRole.id));

    let KAname = args.slice(1).join(" ");
    if (!KAname) return errors.usage(message, "addcreator", "Specify a name for the channel and role");
    
    let nameRole = message.guild.roles.find(`name`, KAname);
    if (!nameRole) {
        try {
            nameRole = await message.guild.createRole({
                name: KAname
            })
        } catch(e) {
            console.log(e.stack);
        }
    }
    
    let everyoneRole = message.guild.roles.find(`name`, "@everyone")
    let nameChannel = message.guild.channels.find(`name`, KAname.split(" ").join("-").toLowerCase());
    
    if (!nameChannel) {
        try {
            nameChannel = await message.guild.createChannel(KAname, "text", [{
                id: KAUser.id,
                deny: ["CREATE_INSTANT_INVITE"],
                allow: ["MANAGE_CHANNELS", "MANAGE_ROLES_OR_PERMISSIONS", "MANAGE_WEBHOOKS", "READ_MESSAGES", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "ADD_REACTIONS"]
            }, {
                id: nameRole.id,
                deny: ["CREATE_INSTANT_INVITE"],
                allow: ["READ_MESSAGES", "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "ADD_REACTIONS"]
            }, {
                id: everyoneRole.id,
                deny: ["READ_MESSAGES"]
            }], `KA Subscription channel for ${KAUser}`)
        } catch(e) {
            console.log(e.stack);
        }
    }

    let subCategory = message.guild.channels.find(`name`, "Subscriptions");
    nameChannel.setParent(subCategory.id);

    await (KAUser.addRole(nameRole.id));

    try {
        await KAUser.send(`Congratulations, you have been given your very own KA Subscription channel in ${message.guild.name}! You can edit it as you wish, and give people updates about what you're working on. Check it out over at <#${nameChannel.id}>. Enjoy!`);
    } catch(e) {
        message.channel.send(`Congratulations ${KAUser}, you have been given your very own KA Subscription channel! You can edit it as you wish, and give people updates about what you're working on. Check it out over at <#${nameChannel.id}>. Enjoy!`);
    }

    let kaCreators = require("../kacreators.json");
    if (!kaCreators.names) {
        kaCreators = {
            names: []
        }
    }
    kaCreators.names.push(KAname);
    
    fs.writeFile("./kacreators.json", JSON.stringify(kaCreators), (err) => {
        if (err) console.log(err);
    });

    message.channel.send("KA Creator: `" + KAname + "` successfully added. Make sure to change the role color if necessary");
}

module.exports.help = {
    name: "addcreator",
    desc: "Set up a channel and role for a KA Creator",
    usage: " [user] [name]",
    perms: "Guardian"
}