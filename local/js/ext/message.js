
class Message {

	type = null;
	data = null;

	constructor(type, data=null) {
		this.type = type;
		this.data = data;
		return;
	};

};

export default Message;
