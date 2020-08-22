import DiscordJS from "discord.js";
import i18n from "i18n";

import permissions from "./permissions";

import _8ball from "./8ball";
import catbomb from "./catbomb";
import catme from "./catme";
import catwith from "./catwith";
import chucknorris from "./chucknorris";
import github from "./github";
import help from "./help";
import kebac from "./kebac";
import list from "./list";
import owo from "./owo";
import pick from "./pick";
import ping from "./ping";
import pong from "./pong";
import roll from "./roll";
import sb from "./sb";
import sba from "./sba";
import sbe from "./sbe";
import sbl from "./sbl";
import sbr from "./sbr";
import surun from "./surun";
import top from "./top";
import xkcd from "./xkcd";
import youtube from "./youtube";

import { lock, autodisconnect } from "../util";

const prefix = "sudo ";

export const commands: {
    [key: string]: (
        message: DiscordJS.Message,
        ...args: string[]
    ) => Promise<any>;
} = {
    _8ball,
    catbomb,
    catme,
    catwith,
    chucknorris,
    github,
    help,
    kebac,
    list,
    owo,
    pick,
    ping,
    pong,
    roll,
    sb,
    sba,
    sbe,
    sbl,
    sbr,
    surun,
    top,
    xkcd,
    youtube,
};

export default async (message: DiscordJS.Message): Promise<void> => {
    try {
        if (message.author.bot || !message.guild) return;
        else if (message.mentions.everyone) {
            await message.react("🇦");
            await message.react("🇳");
            await message.react("🇬");
            await message.react("🇪");
            await message.react("🇷");
            await message.react("🇾");
            await message.react("😡");
            return;
        } else if (
            message.client.user &&
            message.mentions.has(message.client.user)
        ) {
            await message.react("👀");
            return;
        }

        if (message.content.indexOf(prefix) !== 0) return;
        if (!permissions(message)) {
            await message.react("🚫");
            return;
        }

        await lock.wait(message.guild.id);

        let command = message.content.substr(prefix.length).split(" ")[0];
        if (/^\d/.test(command)) command = "_" + command;
        let args: string[] = message.content
            .substr(prefix.length)
            .split(" ")
            .slice(1);

        console.log(
            message.member?.displayName,
            message.member?.id,
            message.guild.id,
            message.content
        );

        if (commands[command]) {
            i18n.setLocale(message.author.locale || "en");
            await commands[command](message, ...args);
        } else {
            console.log("command not found", command);
            await message.react("❓");
        }

        autodisconnect(message.guild.id, message);
    } catch (e) {
        console.error(e);
        if (process.env.NODE_ENV !== "production")
            await message.reply(`${e.message}\n\`\`\`${e.stack}\`\`\``);
        else await message.react("☠️");
    } finally {
        if (message.guild) lock.free(message.guild.id);
    }
};
