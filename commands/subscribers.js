const Discord = require("discord.js");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let commandChannel = message.guild.channels.find(`name`, "commands");
    if (message.channel.name !== "commands") return errors.other(message, `View subscriptions in ${commandChannel}`);
    
    let kaCreators = require("../kacreators.json");
    if (!kaCreators.names || kaCreators.names.length < 1) return errors.other(message, "There are currently no KA Creator roles");

    let subCreator = message.mentions.members.first();
    if (!subCreator) subCreator = args.join(" ");
    if (!subCreator) subCreator = message.author;
    
    let creator = -1;
    for (var i = 0; i < kaCreators.users.length; i++) {
        if (kaCreators.users[i] === subCreator.id || kaCreators.users[i] === subCreator || (subCreator.toString() === subCreator && kaCreators.names[i].toLowerCase() === subCreator.toLowerCase())) creator = i;
    }

    if (creator === -1) return errors.noPerms(message, "User must be a KA Creator");

    let subs = [];
    message.guild.members.forEach(m => {
        m.roles.forEach(r => {
            if (r.id === kaCreators.roles[creator]) subs.push(m);
        });
    });

    let sEmbed = new Discord.RichEmbed()
    if (subs.length > 0) {
        sEmbed.setAuthor(kaCreators.names[creator])
        sEmbed.addField(`${subs.length} total subscribers`, subs)
    }
    else sEmbed.addField(kaCreators.names[creator], "No subscribers")

    message.channel.send(sEmbed);
}

module.exports.help = {
    name: "subscribers",
    usage: " (user)",
    desc: "View all of your subscribers",
    info: "Only applicable for a KA Creator"
}