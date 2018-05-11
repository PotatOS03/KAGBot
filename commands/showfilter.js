const Discord = require("discord.js");
const fs = require("fs");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let guardianRole = message.guild.roles.find(`name`, "Guardian");
    if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Guardian");

    let languageFilters = require("../languagefilters.json");

    if (!languageFilters[message.guild.id] || languageFilters[message.guild.id].words.length < 1) return errors.usage(message, "removefilter", "There are no message filters in this server");
    
    let fEmbed = new Discord.RichEmbed()
    .setTitle(`${message.guild.name} message filter`)
    .addField("Words", languageFilters[message.guild.id].words);

    try {
        await message.author.send(fEmbed);
    } catch(e) {
        message.channel.send(fEmbed);
    }
}

module.exports.help = {
    name: "showfilter",
    desc: "Show the message filter for the server",
    perms: "Guardian"
}