/* eslint indent: 1*/

const { getModule, React, FluxDispatcher } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { Plugin } = require('powercord/entities');
const shouldDisplayNotifications = getModule([ 'shouldDisplayNotifications' ], false);
const parser = getModule([ 'parse', 'parseTopic' ], false).parse;
const MessageContent = getModule(m => m.type && m.type.displayName === 'MessageContent', false);
const Settings = require('./Settings');

module.exports = class InAppNotifciations extends Plugin {
    async startPlugin () {
        powercord.api.settings.registerSettings('ian-settings', {
            category: this.entityID,
            label: 'In App Notifications',
            render: Settings
        });

        this.messageGot = this.messageGot.bind(this);
        FluxDispatcher.subscribe('MESSAGE_CREATE', this.messageGot);

        // const shouldNotify = getModule([ 'shouldNotify' ], false);
        // inject('ian-notify', shouldNotify, 'shouldNotify', (args) => {
        //     console.log(args);
        //     return args;
        // }, true);
    }

    pluginWillUnload () {
        FluxDispatcher.unsubscribe('MESSAGE_CREATE', this.messageGot);
        powercord.api.settings.unregisterSettings('ian-settings');
        // uninject('ian-notify');
    }

    messageGot (msg) {
        // const user = getModule([ 'getCurrentUser' ]).getCurrentUser();
        const { shouldNotify } = getModule([ 'shouldNotify' ], false);
        console.log(shouldNotify(msg, msg.channel_id));
    }
};
