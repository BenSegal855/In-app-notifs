const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { Plugin } = require("powercord/entities");
const { getGuild } = getModule(["getGuild"], false);
const parser = getModule(["parse", "parseTopic"], false).parse;
const MessageContent = getModule(m => m.type && m.type.displayName == "MessageContent", false);
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

            inject( "ian", show, "makeTextChatNotification", (args, other) => {
                console.log(args);
                const toast = (Math.random().toString(36) + Date.now()).substring(2, 7);
                const guild = getGuild(args[0].guild_id);

                if (!args[1].content.match(new RegExp(`<(@!?|#|@&)?(${getModule(["getCurrentUser"], false).getCurrentUser().id})>`,`g`))
                    && onPing)
                    return;

                powercord.api.notices.sendToast(toast, {
                    header: guild ? `${args[2].username} in ${guild.name}` : args[2].username,
                    timeout: Math.min(Math.max(args[1].content.split(" ").length * 0.5e3, 4e3), 10e3),
                    content: React.createElement(MessageContent, {
                      message: {
                        ...args[1],
                        isEdited: () => false,
                        hasFlag: () => false // somehow having theese be functions that return false makes discord not crash????????????
                      },
                      content: parser(args[1].content, true, { channelId: args[0].id })
                    }),
                    buttons: [ {
                        text: `Jump to ${guild ? `#${args[0].name}` : "DM's"}`,
                        look: "outlined",
                        size: "small",
                        onClick: () => transition.transitionTo(`/channels/${guild ? guild.id : "@me"}/${args[0].id}/${args[1].id}`)
                    }, {
                        text: "Dismiss",
                        look: "ghost",
                        size: "small",
                    } ]
                });
                if (document.hasFocus())
                    other = {body: "", name: "", icon: ""};
                    
                return other;
            }, false );
        } catch (error) {
            console.error(`There seems to have been a problem with the in app notifications. Please report this to the developer.\n\n${error}`);
        }
    }

    pluginWillUnload() {
        uninject("ian");
        powercord.api.settings.unregisterSettings(`ian-settings`);
    }
};
