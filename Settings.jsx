const { SwitchItem } = require("powercord/components/settings");
const { React } = require("powercord/webpack");

module.exports = class Settings extends React.Component {
render() {
    const { getSetting, toggleSetting } = this.props;

    return (
        <div>
            <SwitchItem
                note="If to only notify you if you were pinged or not."
                value={getSetting("notifyPing", false)}
                onChange={() => toggleSetting("notifyPing")}
            >
            Only notify on ping
            </SwitchItem>

            <SwitchItem
                note="If you want Discord not to send you desktop notifications when you have Discord active, but still whant them when Discord isn't"
                value={getSetting("blockDesktop", false)}
                onChange={() => toggleSetting("blockDesktop")}
            >
            Block desktop notification when Discord is active
            </SwitchItem>
        </div>
    );
}
};
