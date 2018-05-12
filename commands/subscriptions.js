const Discord = require("discord.js");
const errors = require("../utilities/errors.js");

module.exports.run = async (bot, message, args) => {
    let commandChannel = message.guild.channels.find(`name`, "commands");
    if (message.channel.name !== "commands") return errors.other(message, `View subscriptions in ${commandChannel}`);
    
    let kaCreators = require("../kacreators.json")
    if (!kaCreators.names || kaCreators.names.length < 1) return errors.other(message, "There are currently no KA Creator roles");
    
    kaCreators.names.sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1);
    if (!kaCreators.names || kaCreators.names.length < 1) return errors.other(message, "There are currently no KA Creator roles");

    let subMembers = [];

    let longestSubName = 0;

    for (var i = 0; i < kaCreators.names.length; i++) {
        if (kaCreators.names[i].length > longestSubName) {
            longestSubName = kaCreators.names[i].length;
        }
    }
    
    let subsText = "";
    for (var i = 0; i < kaCreators.names.length; i++) {
        subMembers.push(0);
        message.guild.members.forEach(m => {
            m.roles.forEach(r => {
                if (r.name === kaCreators.names[i]) subMembers[i]++;
            });
        });

        subsText += "`" + kaCreators.names[i];
        for (var j = -3; j < longestSubName - kaCreators.names[i].length; j++) {
            subsText += " ";
        }
        subsText += subMembers[i] + " subscribers`\n";
    }

    let sEmbed = new Discord.RichEmbed()
    .addField("KA Subscriptions", subsText)
    .setFooter(`Use the subscribe command to subscribe to or unsubscribe from a KA Creator`)

    message.channel.send(sEmbed);
}

module.exports.help = {
    name: "subscriptions",
    desc: "View all KA Creators",
    info: "How many subscribers each has"
}