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
        </div>
    );
}
};
