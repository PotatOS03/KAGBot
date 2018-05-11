const Discord = require("discord.js");
const fs = require("fs");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let guardianRole = message.guild.roles.find(`name`, "Guardian");
    if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Guardian");

    if (!args[0]) return errors.usage(message, "addfilter", "Specify a word to add to the message filter");
    if (args[1]) return errors.usage(message, "addfilter", "The filter can only be one word");

    let languageFilters = require("../languagefilters.json");

    if (!languageFilters[message.guild.id]) languageFilters[message.guild.id] = {
        words: []
    }
    
    languageFilters[message.guild.id].words.push(args[0].toLowerCase());

    fs.writeFile("./languagefilters.json", JSON.stringify(languageFilters), (err) => {
        if (err) console.log(err);
    });

    message.channel.send(`${args[0]} has been successfully added to the message filter`);
}

module.exports.help = {
    name: "addfilter",
    desc: "Add a word to the message filter",
    usage: " [message]",
    perms: "Guardian"
}