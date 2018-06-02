const Discord = require("discord.js");

module.exports.log = (bot, message, error) => {
    let logChannel = bot.channels.find("id", "446758267490926592");
    let errorMessage = "";
    for (var i = 0; i < Math.min(error.toString().length, 1018); i++) {
        errorMessage += error.toString()[i];
    }

    let logEmbed = new Discord.RichEmbed()
    .setDescription(`Error in ${message.channel.toString()} (${message.guild.name})`)
    .setColor("f04747")
    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
    .addField("Message", message.content)
    .addField("Error", "```" + errorMessage + "```")
    .setTimestamp(message.createdAt)
    
    logChannel.send(logEmbed);
    message.channel.send("Uh oh, it looks like an error has occurred! A log has been sent and will be investigated shortly.");
}

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

    let usageEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle("INCORRECT USAGE")
    .setColor("f04747")
    .addField("Message Sent", message.content)
    .addField("Usage", "`" + `${botconfig.prefix}${command.name}${command.usage}` + "`", true)
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
