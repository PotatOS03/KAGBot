const Discord = require("discord.js");

module.exports.noPerms = (message, perm) => {
    message.delete().catch();
    
    let permEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle("NO PERMISSIONS")
    .setColor("f04747")
    .addField("Message Sent", message.content)
    .addField("Insufficient Permission", perm);

    message.channel.send(permEmbed).then(m => m.delete(10000));
}

module.exports.usage = (message, command, info) => {
    message.delete().catch();

    let botconfig = require("../botconfig.json");

    let cmdHelp = require(`../commands/${command}.js`).help;

    let usageEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle("INCORRECT USAGE")
    .setColor("f04747")
    .addField("Message Sent", message.content)
    .addField("Usage", "`" + `${botconfig.prefix}${cmdHelp.name}${cmdHelp.usage}` + "`", true)
    .addField("Info", info, true);

    message.channel.send(usageEmbed).then(msg => msg.delete(60000));
}

module.exports.other = (message, info) => {
    message.delete().catch();

    let embed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle("ERROR")
    .setColor("f04747")
    .addField("Message Sent", message.content)
    .addField("Info", info);

    message.channel.send(embed).then(msg => msg.delete(30000));
}
