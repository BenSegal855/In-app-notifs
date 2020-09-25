const { getModule } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { Plugin } = require("powercord/entities");

const getUser = getModule(["getCurrentUser"], false).getUser;
const getChannel = getModule(["getChannel"], false).getChannel;
const getGuild = getModule(["getGuild"], false).getGuild;

const Settings = require("./Settings");

module.exports = class InAppNotifciations extends Plugin {
  startPlugin() {
    powercord.api.settings.registerSettings(`ian-settings`, {
      category: this.entityID,
      label: "In App Notifications",
      render: Settings,
    });

    const onPing = this.settings.get("notifyPing", false);

    try {
      const show = getModule(["makeTextChatNotification"], false);
      const transition = getModule(["transitionTo"], false);

      inject("ian", show, "makeTextChatNotification", (args, res) => {
        const toast = (Math.random().toString(36) + Date.now()).substring(2, 7);

        const server = getGuild(args[0].guild_id);

        if (!args[1].content.match(/<(@!?|#|@&)?(\d+)>/g) && onPing) return;

        powercord.api.notices.sendToast(toast, {
          header: server
            ? `${args[2].username} in ${server.name}`
            : args[2].username,
          timeout: Math.min(
            Math.max(args[1].content.split(" ").length * 0.5e3, 4e3),
            10e3
          ),
          content: this.parse(args[1].content, server),
          buttons: [
            {
              text: `Jump to ${
                server ? `#${args[0].name}` : "Direct Messages"
              }`,
              look: "outlined",
              size: "small",
              onClick: () =>
                transition.transitionTo(
                  `/channels/${args[0].guild_id ?? "@me"}/${args[0].id}/${
                    args[1].id
                  }`
                ),
            },

            {
              text: "Dismiss",
              look: "ghost",
              size: "small",
            },
          ],
        });

        return res;
      });
    } catch (error) {
      console.error(
        `There seems to have been a problem with the in app notifications. Please report this to the developer.\n\n${error}`
      );
    }
  }

  pluginWillUnload() {
    uninject("ian");
    powercord.api.settings.unregisterSettings(`ian-settings`);
  }

  parse(content, guild) {
    return content
      .replace(/<@!?(\d+)>/g, (_, p) => `@${getUser(p).username}`)
      .replace(/<#(\d+)>/g, (_, p) => `#${getChannel(p).name}`)
      .replace(/<@&(\d+)>/g, (_, p) => `@${guild.roles[p].name}`);
  }
};
