const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if (message.author.id !== "286664522083729409") return;
    let code = args.slice(0).join(" ");
    try {
        await eval(code);
    } catch(e) {
        message.channel.send("`" + e.toString() + "`");
    }
}

module.exports.help = {
    name: "eval",
    desc: "Run code",
    group: "Developer"
}