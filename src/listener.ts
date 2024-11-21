import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  Interaction,
  Message,
} from "discord.js";
import { EventEmitter } from "events";

export class Listener {
  static awaitConfirmation(
    prompt: string,
    messageOrInteraction: Message | CommandInteraction,
    userIds: string[],
    noLogs?: boolean
  ) {
    const btns = [
      new ButtonBuilder()
        .setCustomId(`confirm`)
        .setLabel(`Confirm`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`cancel`)
        .setLabel(`Cancel`)
        .setStyle(ButtonStyle.Danger),
    ];
    const row = new ActionRowBuilder().addComponents(...btns);
    const listener = new EventEmitter();
    const used: string[] = [];
    const res: boolean[] = [];
    if (messageOrInteraction instanceof Message) {
      const message = messageOrInteraction;
      message
        .reply({
          components: [row as any],
          content: `${prompt}`,
        })
        .then((msg) => {
          const collector = msg.createMessageComponentCollector({
            time: 30_000,
          });
          collector.on("end", (collected) => {
            try {
                console.log(used);
              if(used.length != userIds.length) msg.edit({
                content: `This has expired!`,
                components: [
                  new ActionRowBuilder().addComponents(
                    ...btns.map((x) => x.setDisabled(true))
                  ) as any,
                ],
              });
              else msg.edit({
                content: `Processing...`,
                components: [
                    new ActionRowBuilder().addComponents(
                      ...btns.map((x) => x.setDisabled(true))
                    ) as any,
                  ]
              })
              collector.stop();
              listener.emit(`end`, res);
            } catch (error) {}
          });
          collector.on("collect", async (i) => {
            if (userIds.length != 0 && !userIds.includes(i.user.id))
              return await i.reply({
                content: `You are not allowed to do this!`,
                ephemeral: true,
              });
            used.push(i.user.id);
            res.push(i.customId == `confirm`)
            listener.emit(`clicked`, i.user);
            if (userIds.length == used.length) {
              collector.stop();
              await i.update({
                components: [Listener.disableBtn(btns) as any],
              });
            }
            if (i.channel?.isSendable()) {
              try {
                if (!noLogs) await i.message?.reply(`Confirmed by ${i.user}`);
              } catch (error) {}
            }
          });
        });
    } else {
      const interaction = messageOrInteraction;
      interaction
        .followUp({
          components: [row as any],
        })
        .then((msg) => {
          const collector = msg.createMessageComponentCollector({
            time: 30_000,
          });
          collector.on("end", (collected) => {
            try {
              msg.edit({
                content: `This has expired!`,
                components: [
                  new ActionRowBuilder().addComponents(
                    ...btns.map((x) => x.setDisabled(true))
                  ) as any,
                ],
              });
              collector.stop();
              listener.emit(`end`, res);
            } catch (error) {}
          });
          collector.on("collect", async (i) => {
            if (userIds.length != 0 && !userIds.includes(i.user.id))
              return await i.reply({
                content: `You are not allowed to do this!`,
                ephemeral: true,
              });
            used.push(i.user.id);
            res.push(i.customId == `confirm`)
            listener.emit(`clicked`, i.user);
            if (userIds.length == used.length) {
              collector.stop();
              await i.update({
                components: [Listener.disableBtn(btns) as any],
              });
            }
            if (i.channel?.isSendable()) {
              try {
                if (!noLogs) await i.message?.reply(`Confirmed by ${i.user}`);
              } catch (error) {}
            }
          });
        });
    }
    return listener;
  }
  static disableBtn(btns: ButtonBuilder[]) {
    return new ActionRowBuilder().addComponents(
      ...btns.map((x) => x.setDisabled(true))
    );
  }
}
