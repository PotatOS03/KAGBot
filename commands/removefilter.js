const Discord = require("discord.js");
const fs = require("fs");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let guardianRole = message.guild.roles.find(`name`, "Guardian");
    if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Guardian");

    if (!args[0]) return errors.usage(message, "removefilter", "Specify a word to remove from the filter");

    let languageFilters = require("../languagefilters.json");

    if (!languageFilters[message.guild.id] || languageFilters[message.guild.id].words.length < 1) return errors.usage(message, "removefilter", "There are no message filters in this server");

    if (!languageFilters[message.guild.id].words.includes(args[0].toLowerCase())) return errors.usage(message, "removefilter", `${args[0]} is not in the word filter`);

    for (var i = 0; i < languageFilters[message.guild.id].words.length; i++) {
        if (languageFilters[message.guild.id].words[i] === args[0].toLowerCase()) languageFilters[message.guild.id].words.splice(i);
    }

    fs.writeFile("./languagefilters.json", JSON.stringify(languageFilters), (err) => {
        if (err) console.log(err);
    });

    message.channel.send(`${args[0]} has been successfully removed from the message filter`);
}

module.exports.help = {
    name: "removefilter",
    desc: "Remove a word from the message filter",
    usage: " [message]",
    perms: "Guardian"
}