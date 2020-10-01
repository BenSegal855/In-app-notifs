const { SwitchItem } = require("powercord/components/settings");
const { React } = require("powercord/webpack");

module.exports = class Settings extends React.Component {
render() {
    const { getSetting, toggleSetting } = this.props;

    return (
        <div>
            <SwitchItem
                note="When enabled, notify when pinged."
                value={getSetting("notifyPing", false)}
                onChange={() => toggleSetting("notifyPing")}
            >
            Only notify on ping
            </SwitchItem>

            <SwitchItem
                note="When enabled, desktop notifications will be disabled; if Discord is active."
                value={getSetting("blockDesktop", false)}
                onChange={() => toggleSetting("blockDesktop")}
            >
            Disable desktop notifications when Discord is active
            </SwitchItem>

            <SwitchItem
                note="When enabled, notifications will not vanish automatically."
                value={getSetting("sticky", false)}
                onChange={() => toggleSetting("sticky")}
            >
            Sticky Notifications
            </SwitchItem>
        </div>
    );
}
};
