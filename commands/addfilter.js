const Discord = require("discord.js");
const fs = require("fs");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let guardianRole = message.guild.roles.find(`name`, "Guardian");
    if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Guardian");
    
    if (!args[0]) return errors.usage(message, "addfilter", "Specify the type of filter and message");
    if (args[0] !== "sequence" && args[0] !== "swear") return errors.usage(message, "addfilter", "Type of filter must be either a sequence or a swear");

    if (!args[1]) return errors.usage(message, "addfilter", "Specify a word to add to the message filter");
    if (args[2]) return errors.usage(message, "addfilter", "The filter can only be one word");

    let languageFilters = require("../languagefilters.json");

    if (!languageFilters[message.guild.id]) languageFilters[message.guild.id] = {
        words: [],
        swears: []
    }
    
    if (args[0] === "sequence") {
        if (languageFilters[message.guild.id].words.includes(args[1].toLowerCase())) return errors.usage(message, "addfilter", `${args[1]} is already in the message filter`);
        languageFilters[message.guild.id].words.push(args[1].toLowerCase());
    }
    if (args[0] === "swear") {
        if (languageFilters[message.guild.id].swears.includes(args[1].toLowerCase())) return errors.usage(message, "addfilter", `${args[1]} is already in the message filter`);
        languageFilters[message.guild.id].swears.push(args[1].toLowerCase());
    }

    fs.writeFile("./languagefilters.json", JSON.stringify(languageFilters), (err) => {
        if (err) console.log(err);
    });

    if (args[0] === "sequence") return message.channel.send(`${args[1]} has been successfully added to the message filter`);
    message.channel.send("Word successfully added to the swear filter");
}

module.exports.help = {
    name: "addfilter",
    desc: "Add a word to the message filter",
    usage: " [sequence/swear] [message]",
    perms: "Guardian",
    info: "`sequence`: Not as strict as swears\n`swear`: Message is deleted if it contains the word at all"
}