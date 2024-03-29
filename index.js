const { getModule, React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { Plugin } = require('powercord/entities');
const shouldDisplayNotifications = getModule([ 'shouldDisplayNotifications' ], false);
const Settings = require('./components/Settings');
const MsgContent = require('./components/MsgContent');

module.exports = class InAppNotifications extends Plugin {

	async startPlugin() {
		this.loadStylesheet('./style.css');

		powercord.api.settings.registerSettings('ian-settings', {
			category: this.entityID,
			label: 'In App Notifications',
			render: Settings
		});

		try {
			const show = getModule([ 'makeTextChatNotification' ], false);
			const transition = getModule([ 'transitionTo' ], false);
			const { getGuild } = getModule([ 'getGuild' ], false);
			const { ack } = getModule([ 'ack', 'ackCategory' ], false);

			let toasts = [];

			inject('ian', show, 'makeTextChatNotification', (args) => {
				const [ channel, msg, author ] = args;

				const onPing = this.settings.get('notifyPing', false);
				const sticky = this.settings.get('sticky', false);
				const timeMult = this.settings.get('timeMult', 1);

				const toast = `ian-${(Math.random().toString(36) + Date.now()).substring(2, 7)}`;
				toasts.push(toast);
				const guild = getGuild(channel.guild_id);
				const time = sticky ? null : timeMult * Math.min(Math.max(msg.content.split(' ').length * 0.5e3, 4e3), 10e3);

				if (!msg.mentions.find(user => user.id === getModule([ 'getCurrentUser' ], false).getCurrentUser().id)
						&& onPing) {
					return args;
				}

				powercord.api.notices.sendToast(toast, {
					header: `${author.username} ${msg.referenced_message ? 'replied' : ''} ${guild ? `in ${guild.name}` : 'in DM\'s'}`,
					timeout: time,
					image: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`,
					imageClassName: 'ian-pfp',
					content: React.createElement(MsgContent, { msg }),
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
						onClick: () => ack(channel.id)
					}, {
						text: `Jump to ${guild ? `#${channel.name}` : 'DM\'s'}`,
						look: 'outlined',
						size: 'small',
						onClick: () => transition.transitionTo(`/channels/${guild ? guild.id : '@me'}/${channel.id}/${msg.id}`)
					} ]
				});

				return args;
			}, true);

			inject('ian-desktop-blocker', shouldDisplayNotifications, 'shouldDisplayNotifications', (args) => {
				const blockDesktop = this.settings.get('blockDesktop', false);
				if (blockDesktop && document.hasFocus()) {
					return false;
				}
				return args;
			}, true);

			powercord.api.notices.on('toastLeaving', (toastID) => {
				if (toastID.startsWith('ian-')) {
					toasts = toasts.filter((id) => id !== toastID);
				}
			});
		} catch (error) {
			this.error(`There seems to have been a problem with the in app notifications. Please report this to the developer.\n\n${error}`);
		}
	}

	pluginWillUnload() {
		uninject('ian');
		uninject('ian-desktop-blocker');
		uninject('ian-embed-test');
		powercord.api.settings.unregisterSettings('ian-settings');
	}

};
