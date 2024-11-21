import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import { Pagination } from "pagination.djs";
import { setTimeout as wait } from "node:timers/promises";
import config from "../config.json";
import { Logger, chunkize, commatize } from "./utils";
import { Listener } from "./listener";
const botAdmins = ["881113828195205131"];

const client = new Client({
  intents: ["GuildMessages", "Guilds", "GuildMembers", "MessageContent"],
  allowedMentions: {
    repliedUser: false,
  },
});

client.on("ready", () => {
  Logger.info(`Logged in as ${client.user?.tag}`);
});

client.on(`messageCreate`, async (message) => {
  if (message.author.bot || !message.guild) return;

  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift()?.toLowerCase();
  if (!botAdmins.includes(message.author.id)) return;
  if (command == `list`) {
    const pagination = new Pagination(message);
    const guildCache = await client.guilds.fetch();
    const guildList = await Promise.all(
      guildCache.map(async (guild) => await guild.fetch())
    );
    const guilds = guildList.map((x) => ({
      name: x.name,
      count: x.memberCount,
      id: x.id,
      owner: x.ownerId,
    }));
    let chunked = chunkize(guilds, 20);
    const embeds = chunked.map((x, i) => {
      return new EmbedBuilder()
        .setTitle(`Guild List ${i + 1}/${chunked.length}`)
        .setColor(`Gold`)
        .setDescription(
          x
            .map(
              (g, j) =>
                `\`${i * 20 + (j + 1)}.\` **${g.name}** \`|\` *${commatize(
                  g.count || 0
                )} Members* \`|\` 👑 \`${g.owner}\``
            )
            .join(`\n`)
        );
    });
    pagination.setEmbeds(embeds);
    pagination.render();
  } else if (command == `massdm`) {
    if (!args[0] || isNaN(parseInt(args[0])))
      return message.reply(`Please provide a guild ID or index!`);
    const guild =
      client.guilds.cache.get(args[0]) ||
      (await client.guilds.fetch(args[0]).catch((err) => {})) ||
      client.guilds.cache.at(parseInt(args[0])-1);
    if (!guild) return await message.reply(`Cannot find that guild!`);

    const listener = Listener.awaitConfirmation(
      `Are you sure do you want to run Mass DM on **${
        guild.name
      }** with *${commatize(guild.memberCount)}* members?`,
      message,
      [message.author.id],
      true
    );
    listener.on(`end`, async (confirmed) => {
      console.log(confirmed);
      if (confirmed.includes(false)) return;
      const members = await guild.members.fetch();
      console.log(members.size);
      const dmList = members.filter(
        (x) =>
          !x.user.bot &&
          !x.permissions.has(PermissionsBitField.Flags.Administrator)
      );
      const embed = new EmbedBuilder()
        .setTitle(`Mass DM <a:m_loading:1309027558729449508>`)
        .setColor(`Gold`)
        .setDescription(
          `- **Server:** ${guild.name}\n- **Member Count:** ${
            guild.memberCount
          }\n> -# Avoiding ${guild.memberCount - dmList.size} bots & admins`
        );
      const btns: ButtonBuilder[] = [
        new ButtonBuilder()
          .setCustomId(`counter`)
          .setDisabled(true)
          .setStyle(ButtonStyle.Secondary)
          .setLabel(`0/${dmList.size}`),
      ];
      const row = new ActionRowBuilder().addComponents(...btns);
      const msg = await message.channel.send({
        embeds: [embed],
        components: [row as any],
      });
      let completed: { id: string; name: string }[] = [];
      const dmListArray = Array.from(dmList.values());
      const chunk = chunkize(dmListArray, 10);
      let chunkIndex = 0;
      while (completed.length < chunk.length) {
        for (let i = 0; i < 10; i++) {
          let user = chunk[chunkIndex][i];
          completed.push({ id: user?.id, name: user?.user?.tag });
          if (!user) continue;
          try {
            const dmChannel = await chunk[chunkIndex][i].createDM();
            if (dmChannel.isSendable()) {
              await dmChannel
                .send({
                  content: `${config.message}`,
                })
                .then((x) => {
                  if (x?.createdTimestamp) {
                    Logger.success(
                      `Sent DM to ${user.user.tag}! [${completed.length}/${dmList.size}]`
                    );
                  } else Logger.error(`Failed to DM ${user.user.tag}...`);
                });
            } else Logger.error(`DMs closed for ${user.user.tag}...`);
          } catch (error) {
            console.log(error);
            Logger.error(`Failed to DM ${user?.user?.tag}...`);
          }
          await wait(1000);
        }
        Logger.warn(`DM'd 10 users...`);
        update();
        await wait(5000);

        chunkIndex++;
        //const chunk = chunkize(dmList, 100);
      }
      Logger.success(`Completed mass DM!`);
      message.channel.send(
        `✅ | DM'd **${completed.filter((x) => x.id).length}** users!`
      );
      async function update() {
        btns[0].setLabel(`${completed.filter((x) => x.id).length}/${dmList.size}`);
        if (completed.filter((x) => x.id).length == dmList.size)
          btns[0].setStyle(ButtonStyle.Success);
        const logs = completed
          .reverse()
          .filter((x) => x.id)
          .filter((_, i) => i < 15)
          .map((x) => `Sent DM to ${x.name} (${x.id})`);

        if (msg.editable) {
          await msg.edit({
            components: [new ActionRowBuilder().addComponents(...btns) as any],
            embeds: [
              embed.setFields([
                { name: `Audit`, value: "```\n" + logs.join(`\n`) + "```" },
              ]),
            ],
          });
        }
      }
    });
  } else if(command == `help`) {
    const embed = new EmbedBuilder()
      .setTitle(`Help`)
      .setColor(`Gold`)
      .setDescription(
        `**Commands:**\n
        - \`${config.prefix}list\` - Lists all the guilds the bot is in.\n
        - \`${config.prefix}massdm <guild id or index>\` - Sends a mass DM to all members of a guild.`
      );

    message.reply({ embeds: [embed] });
  }
});

client.login(config.token);
