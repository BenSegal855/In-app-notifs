/* eslint indent: 1*/

const { getModule, React, FluxDispatcher } = require('powercord/webpack');
const { Plugin } = require('powercord/entities');
const parser = getModule([ 'parse', 'parseTopic' ], false).parse;
const MessageContent = getModule(m => m.type && m.type.displayName === 'MessageContent', false);
const Settings = require('./Settings');
const toasts = [];

module.exports = class InAppNotifciations extends Plugin {
    async startPlugin () {
        powercord.api.settings.registerSettings('ian-settings', {
            category: this.entityID,
            label: 'In App Notifications',
            render: Settings
        });

        this.messageGot = this.messageGot.bind(this);
        FluxDispatcher.subscribe('MESSAGE_CREATE', this.messageGot);

        /*
         * const shouldNotify = getModule([ 'shouldNotify' ], false);
         * inject('ian-notify', shouldNotify, 'shouldNotify', (args) => {
         *     console.log(args);
         *     return args;
         * }, true);
         */
    }

    pluginWillUnload () {
        FluxDispatcher.unsubscribe('MESSAGE_CREATE', this.messageGot);
        powercord.api.settings.unregisterSettings('ian-settings');
        // uninject('ian-notify');
    }

    messageGot (messageCreate) {
        const msg = messageCreate.message;
        const guild = getModule([ 'getGuild' ], false).getGuild(msg.guild_id);
        const channel = getModule([ 'getChannel' ], false).getChannel(msg.channel_id);
        const { shouldNotify } = getModule([ 'shouldNotify' ], false);

        if (shouldNotify(msg, channel.id)) {
            const transition = getModule([ 'transitionTo' ], false);

            const onPing = this.settings.get('notifyPing', false);
            const sticky = this.settings.get('sticky', false);
            const timeMult = this.settings.get('timeMult', 1);

            const toast = `ian-${(Math.random().toString(36) + Date.now()).substring(2, 7)}`;
            toasts.push(toast);
            const time = sticky ? null : timeMult * Math.min(Math.max(msg.content.split(' ').length * 0.5e3, 4e3), 10e3);

            if (!msg.content.match(new RegExp(`<(@!?|#|@&)?(${getModule([ 'getCurrentUser' ], false).getCurrentUser().id})>`, 'g')) && onPing) {
                return;
            }

            powercord.api.notices.sendToast(toast, {
                header: guild ? `${msg.author.username} in ${guild.name}` : msg.author.username,
                timeout: time,
                content: React.createElement(MessageContent, {
                    message: {
                        ...msg,
                        isEdited: () => false,
                        hasFlag: () => false // somehow having theese be functions that return false makes discord not crash????????????
                    },
                    content: parser(msg.content, true, { channelId: channel.id })
                }),
                buttons: [ {
                    text: toasts.length > 1 ? 'Dismiss all' : 'Dismiss',
                    look: 'ghost',
                    size: 'small',
                    onClick: () => {
                        toasts.forEach((id) => powercord.api.notices.closeToast(id));
                    }
                }, {
                    text: 'Mark as read',
                    look: 'ghost',
                    size: 'small',
                    onClick: () => getModule([ 'ack', 'ackCategory' ], false).ack(channel.id)
                }, {
                    text: `Jump to ${guild ? `#${channel.name}` : 'DM\'s'}`,
                    look: 'outlined',
                    size: 'small',
                    onClick: () => transition.transitionTo(`/channels/${guild ? guild.id : '@me'}/${channel.id}/${msg.id}`)
                } ]
            });
        }
    }
};
