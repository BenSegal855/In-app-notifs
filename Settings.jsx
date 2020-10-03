const { SwitchItem, SliderInput } = require("powercord/components/settings");
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
            <SliderInput
                minValue={ 1 }
                maxValue={ 10 }
                initialValue={ this.props.getSetting("timeMult", 80) }
                markers={[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]}
                className="ianDispTimeMult"
                onValueChange={ v => this.props.updateSetting("timeMult", Math.round(v)) }
                onValueRender={ v => <span>{Math.round(v)} px</span> }
            >Display time multiplier</SliderInput>
        </div>
    );
}
};
