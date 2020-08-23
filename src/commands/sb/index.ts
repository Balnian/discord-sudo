import DiscordJS from "discord.js";
import { Readable } from "stream";

import { waitFor, autodisconnect } from "../../util";
import soundboard from "../../db/soundboard";
import sbl from "../sbl";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (!args[0]) return await sbl(message, ...args);

    if (!message.member?.voice.channel) return message.react("🔇");
    const channel = message.member?.voice.channel;

    for (let arg of args.slice(0, 10)) {
        const file = await soundboard.findOne({
            gid: message.guild?.id,
            key: arg,
        });

        if (!file) return message.reply("sound not found");

        const readable = new Readable({
            read() {
                this.push(file.val);
                this.push(null);
            },
        });

        const connection = await channel.join();
        if (!connection) return message.react("🔇");
        autodisconnect(message);
        const dispatcher = connection.play(readable);

        await waitFor(dispatcher, "finish");

        dispatcher.end();
        readable.destroy();
    }

    return message.react("👍");
};
