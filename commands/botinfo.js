const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let bIcon = bot.user.displayAvatarURL;
    let botEmbed = new Discord.RichEmbed()
    .setDescription("Bot Information")
    .setThumbnail(bIcon)
    .addField("Bot Name", bot.user.username)
    .addField("Created On", bot.user.createdAt)
    .addField("Created By", "<@286664522083729409>")
    .addField("Servers", bot.guilds.size);

    return message.channel.send(botEmbed);
}

module.exports.help = {
    name: "botinfo",
    desc: "Get information about the bot"
}