const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { Plugin } = require('powercord/entities');

const getUser = getModule([ 'getCurrentUser' ], false).getUser;
const getChannel = getModule([ 'getChannel' ], false).getChannel;
const getGuild = getModule([ 'getGuild' ], false).getGuild;

module.exports = class InAppNotifs extends Plugin {
    startPlugin () {
        try {
            const showNotifm = getModule([ 'makeTextChatNotification' ], false);
            const transition = getModule([ 'transitionTo' ], false);

            inject('notifthing-yes', showNotifm, 'makeTextChatNotification', (args) => {
                const toastID = `notif-${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)}`;
                const dispTime = Math.min(Math.max(args[1].content.split(' ').length * 0.5e3, 4e3), 10e3);
                const chanName = args[0].guild_id ? `#${args[0].name}` : 'DM\'s';
                const transitionString = `/channels/${ args[0].guild_id ? args[0].guild_id : '@me'}/${args[0].id}/${args[1].id}`;
                const guild = getGuild(args[0].guild_id);
                const content = /<[@#!&]?[@#!&]?(\d+)>/g.test(args[1].content) ?  this.parse(args[1].content, guild) : args[1].content;

                powercord.api.notices.sendToast(toastID, 
                    { 
                        header: guild ? `${args[2].username} in ${guild.name}` : args[2].username,
                        content: content,
                        timeout: dispTime,
                        buttons: [ {
                            text: `Jump to ${chanName}`,
                            look: 'outlined',
                            size: 'small',
                            onClick: () => {
                                transition.transitionTo(transitionString);
                            }
                        }, {
                            text: 'Dismiss',
                            look: 'ghost',
                            size: 'small'
                        } ]
                    });
                return args;
            }, true);
        } catch (error) {
            console.error('In App Notifs seems to have broken, please contact the developer.');
            console.error(error);
        }
        
    }

    pluginWillUnload () {
        uninject('notifthing-yes');
    }
    
    parse(message, guild) {
        const userRegex = /<@!?(\d+)>/g;
        const chanRegex = /<#!?(\d+)>/g;
        const roleRegex = /<@&?(\d+)>/g;

        //format user mentions
        let formattedMessage = message.replace(userRegex, (m, p) => {
            let username = getUser(p).username;
            return `@${username}`;
        });

        //format channel mentions
        formattedMessage = formattedMessage.replace(chanRegex, (m, p) => {
            let chanName = getChannel(p).name;
            return `#${chanName}`;
        });

        //format role mentions
        formattedMessage = formattedMessage.replace(roleRegex, (m, p) => {
            let roleName = guild.roles[p].name;
            return `@${roleName}`;
        });

        return formattedMessage
    }
};