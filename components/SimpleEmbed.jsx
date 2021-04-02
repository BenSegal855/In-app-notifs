const { React } = require('powercord/webpack');

module.exports = class MsgContent extends React.Component {

	render() {
		const { embed } = this.props;

		const display = embed.title
			? embed.title
			: embed?.author?.name
				? embed.author.name
				: embed?.fields?.length > 0
					? embed.fields[0].name
					: '';

		return <div className='ian-simple-embed'>
			<div className='ian-simple-embed-color'
				style={{ backgroundColor: embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#202225' }} />
			<div className='ian-simple-embed-text'>
				{display}
			</div>
		</div>;
	}

};
