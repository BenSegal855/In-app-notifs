const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { Plugin } = require("powercord/entities");
const shouldDisplayNotifications = getModule(["shouldDisplayNotifications"], false);
const parser = getModule(["parse", "parseTopic"], false).parse;
const MessageContent = getModule(m => m.type && m.type.displayName == "MessageContent", false);
const Settings = require("./Settings");

module.exports = class InAppNotifciations extends Plugin {
    async startPlugin() {
        powercord.api.settings.registerSettings(`ian-settings`, {
            category: this.entityID,
            label: "In App Notifications",
            render: Settings,
        });

        try {
            const show = getModule(["makeTextChatNotification"], false);
            const transition = getModule(["transitionTo"], false);
            const { getGuild } = getModule(["getGuild"], false);
            const { ack } = getModule(["ack", "ackCategory"], false);

            let toasts = [];
            
            inject( "ian", show, "makeTextChatNotification", (args) => {
                const onPing = this.settings.get("notifyPing", false);
                const sticky = this.settings.get("sticky", false);
                const timeMult = this.settings.get("timeMult", 1);

                const toast = `ian-${(Math.random().toString(36) + Date.now()).substring(2, 7)}`;
                toasts.push(toast);
                const guild = getGuild(args[0].guild_id);
                const time = sticky ? null : timeMult * Math.min(Math.max(args[1].content.split(" ").length * 0.5e3, 4e3), 10e3);

                if (!args[1].content.match(new RegExp(`<(@!?|#|@&)?(${getModule(["getCurrentUser"], false).getCurrentUser().id})>`,`g`))
                    && onPing)
                    return args;

                powercord.api.notices.sendToast(toast, {
                    header: guild ? `${args[2].username} in ${guild.name}` : args[2].username,
                    timeout: time,
                    content: React.createElement(MessageContent, {
                        message: {
                            ...args[1],
                            isEdited: () => false,
                            hasFlag: () => false // somehow having theese be functions that return false makes discord not crash????????????
                        },
                        content: parser(args[1].content, true, { channelId: args[0].id })
                    }),
                    buttons: [ {
                        text: toasts.length > 1 ? "Dismiss all" : "Dismiss",
                        look: "ghost",
                        size: "small",
                        onClick: () => {
                            toasts.forEach((id) => powercord.api.notices.closeToast(id));
                        }
                    }, {
                        text: "Mark as read",
                        look: "ghost",
                        size: "small",
                        onClick: () => ack(args[0].id)
                    }, {
                        text: `Jump to ${guild ? `#${args[0].name}` : "DM's"}`,
                        look: "outlined",
                        size: "small",
                        onClick: () => transition.transitionTo(`/channels/${guild ? guild.id : "@me"}/${args[0].id}/${args[1].id}`)
                    } ]
                });

                return args;
            }, true );

            inject( "ian-desktop-blocker", shouldDisplayNotifications, "shouldDisplayNotifications", (args) => {
                const blockDesktop = this.settings.get("blockDesktop", false);
                if (blockDesktop && document.hasFocus()) 
                    return false;
                return args;
            }, true)

            powercord.api.notices.on("toastLeaving", (toastID) => {
                if (toastID.startsWith("ian-"))
                    toasts = toasts.filter((id) =>  id != toastID);
            });

        } catch (error) {
            console.error(`There seems to have been a problem with the in app notifications. Please report this to the developer.\n\n${error}`);
        }
    }

    pluginWillUnload() {
        uninject("ian");
        uninject("ian-desktop-blocker");
        powercord.api.settings.unregisterSettings(`ian-settings`);
    }
};
