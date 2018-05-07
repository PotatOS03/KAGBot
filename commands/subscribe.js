const Discord = require("discord.js");
const fs = require("fs");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let commandChannel = message.guild.channels.find(`name`, "commands");
    if (message.channel.name !== "commands") return errors.other(message, `Subscribe in ${commandChannel}`);

    let kaCreators = require("../kacreators.json");

    if (!args[0]) return errors.usage(message, "subscribe", "Choose a creator to subscribe to\nUse the subscriptions command to view all creators");

    let creatorName = args.slice(0).join(" ");
    let name = -1;

    for (var i = 0; i < kaCreators.names.length; i++) {
        if (kaCreators.names[i].toLowerCase() === creatorName.toLowerCase()) name = i;
    }

    if (name === -1) return errors.usage(message, "subscribe", `${creatorName} is not a creator role`);

    let creatorRole = message.guild.roles.find(`name`, kaCreators.names[name]);

    if (!message.member.roles.has(creatorRole.id)) {
        message.member.addRole(creatorRole.id);

        let sEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.username)
        .addField("Subscribed", kaCreators.names[name]);

        return message.channel.send(sEmbed);
    }

    message.member.removeRole(creatorRole.id);

    let sEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .addField("Unsubscribed", kaCreators.names[name]);

    return message.channel.send(sEmbed);
}

module.exports.help = {
    name: "subscribe",
    desc: "Subscribe to a KA Creator to view their subscription channel",
    usage: " [creator]"
}