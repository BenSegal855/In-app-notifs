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

    FluxDispatcher.subscribe('MESSAGE_CREATE', (msg) => {
      if (this.shouldNotify(msg.message)) {
        console.log(msg);
      }
    });
  }

  pluginWillUnload () {
    /*
     * uninject('ian');
     * uninject('ian-desktop-blocker');
     */
    FluxDispatcher.unsubscribe('MESSAGE_CREATE');
    powercord.api.settings.unregisterSettings('ian-settings');
  }

  shouldNotify (msg) {
    // const user = getModule([ 'getCurrentUser' ]).getCurrentUser();
    return msg.author.id === '465668689920917534';
  }
};
