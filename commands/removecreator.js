const Discord = require("discord.js");
const fs = require("fs");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let guardianRole = message.guild.roles.find(`name`, "Guardian");
    if (!message.member.roles.has(guardianRole.id)) return errors.noPerms(message, "Guardian");

    let subName = args.slice(0).join(" ");
    if (!subName) return errors.usage(message, "removecreator", "No creator specified");

    let kaCreators = require("../kacreators.json");

    let sub = -1;

    for (var i = 0; i < kaCreators.names.length; i++) {
        if (kaCreators.names[i] === subName) sub = i;
    }
    if (sub === -1) return errors.usage(message, "removecreator", `${subName} is not a KA Creator`);

    kaCreators.names.splice(sub);
    kaCreators.users.splice(sub);
    kaCreators.roles.splice(sub);
    kaCreators.channels.splice(sub);
    
    fs.writeFile("./kacreators.json", JSON.stringify(kaCreators), (err) => {
        if (err) console.log(err);
    });

    let subRole = message.guild.roles.find(`name`, subName);
    subRole.delete();

    let subChannel = message.guild.channels.find(`name`, subName.split(" ").join("-").toLowerCase())
    subChannel.delete();

    message.channel.send("KA Creator: `" + subName + "` successfully removed");
}

module.exports.help = {
    name: "removecreator",
    desc: "Remove a KA Creator channel and role",
    usage: " [creator]",
    perms: "Guardian"
}