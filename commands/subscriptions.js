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
    
    let subsText = [""];
    for (var i = 0; i < kaCreators.names.length; i++) {
        subMembers.push(0);
        message.guild.members.forEach(m => {
            m.roles.forEach(r => {
                if (r.id === kaCreators.roles[i]) subMembers[i]++;
            });
        });

        if (subsText[subsText.length - 1].length + longestSubName + subMembers[i].length + 18 > 1024) subsText.push("");

        subsText[subsText.length - 1] += "`" + kaCreators.names[i];
        for (var j = -3; j < longestSubName - kaCreators.names[i].length; j++) {
            subsText[subsText.length - 1] += " ";
        }
        subsText[subsText.length - 1] += subMembers[i] + " subscribers`\n";
    }

    let sEmbed = new Discord.RichEmbed()
    .addField("KA Subscriptions", subsText[0])
    for (var i = 1; i < subsText.length; i++) sEmbed.addField("Continued", subsText[i])
    sEmbed.setFooter(`Use the subscribe command to subscribe to or unsubscribe from a KA Creator`)

    message.channel.send(sEmbed);
}

module.exports.help = {
    name: "subscriptions",
    desc: "View all KA Creators",
    info: "How many subscribers each has"
}