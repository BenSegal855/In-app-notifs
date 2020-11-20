/* eslint indent: 1*/

const { SwitchItem, SliderInput } = require('powercord/components/settings');
const { React } = require('powercord/webpack');

module.exports = class Settings extends React.Component {
    render () {
        const { getSetting, toggleSetting } = this.props;
        return (
            <div>
                <SwitchItem
                    note="When enabled, notify when pinged."
                    value={getSetting('notifyPing', false)}
                    onChange={() => toggleSetting('notifyPing')}
                >
                Only notify on ping
                </SwitchItem>

                <SwitchItem
                    note="When enabled, desktop notifications will be disabled; if Discord is active."
                    value={getSetting('blockDesktop', false)}
                    onChange={() => toggleSetting('blockDesktop')}
                >
                Disable desktop notifications when Discord is active
                </SwitchItem>

                <SwitchItem
                    note="When enabled, notifications will not vanish automatically."
                    value={getSetting('sticky', false)}
                    onChange={() => toggleSetting('sticky')}
                >
                Sticky Notifications
                </SwitchItem>
                <SliderInput
                    stickToMarkers
                    minValue={ 1 }
                    maxValue={ 5 }
                    initialValue={ this.props.getSetting('timeMult', 1) }
                    markers={[ 1, 1.25, 1.5, 2, 2.5, 3, 4, 5 ]}
                    className="ianDispTimeMult"
                    defaultValue={ this.props.getSetting('timeMult', 1) }
                    onValueChange={ v => this.props.updateSetting('timeMult', v) }
                    disabled={getSetting('sticky', false)}
                >Display time multiplier</SliderInput>
            </div>
        );
    }
};
