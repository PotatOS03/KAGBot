const Discord = require("discord.js");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let guardianRole = message.guild.roles.find(`name`, "Guardian");
    if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Guardian");

    let languageFilters = require("../languagefilters.json");

    if (!languageFilters[message.guild.id] || (languageFilters[message.guild.id].words.length < 1 && languageFilters[message.guild.id].swears.length < 1)) return errors.other(message, "There are no message filters in this server");
    
    let fEmbed = new Discord.RichEmbed()
    .setTitle(`${message.guild.name} message filter`)
    if (languageFilters[message.guild.id].words.length > 0) fEmbed.addField("Sequences", languageFilters[message.guild.id].words);
    if (languageFilters[message.guild.id].swears.length > 0) fEmbed.addField("Swears", languageFilters[message.guild.id].swears);

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