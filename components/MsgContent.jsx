const { getModule, React } = require('powercord/webpack');
const MessageContent = getModule(m => m.type && m.type.displayName === 'MessageContent', false);
const parser = getModule([ 'parse', 'parseTopic' ], false).parse;

module.exports = class MsgContent extends React.Component {

	render() {
		const { msg } = this.props;
		const myMsg = {
			...msg,
			isEdited: () => false,
			hasFlag: () => false
		};

		const image = msg.attachments.length > 0 && msg.attachments[0].content_type.includes('image')
			? msg.attachments[0].url
			: null;

		return <div>
			<MessageContent
				message={myMsg}
				content={parser(msg.content, true, { channelId: msg.channel_id })}
			/>
			{ image && <img src={image} width={260}/> }
		</div>;
	}

};
