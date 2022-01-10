const core = require('@actions/core');
const axios = require('axios');

(async function main() {
	const instanceName = core.getInput('instance-name', { required: true });
	const toolId = core.getInput('tool-id', { required: true });
	const username = core.getInput('devops-integration-user-name', { required: true });
	const pass = core.getInput('devops-integration-user-pass', { required: true });
	const defaultHeaders = { 'Content-Type': 'application/json' };

	const sncChangeUrl = `https://${username}:${pass}@${instanceName}.service-now.com/api/sn_devops/devops/orchestration/changeControl?toolId=${toolId}`;

	const callbackUrl = core.getInput('callback', { required: true });
	let callbackParamsString = core.getInput('callback-params', { required: true });
	let callbackParams = {};

	
	try {
		callbackParams = JSON.parse(callbackParamsString);
	} catch (e) {
		core.setFailed(`there is no ref defined in callback-params: ${callbackParamsString}`);
	}

	if(!callbackParams.ref) {
		core.setFailed(`exception parsing callbackParams ${e}`);
	}
	

	let githubContext = core.getInput('context-github', { required: true })

	try {
	    githubContext = JSON.parse(githubContext);
	} catch (e) {
	    core.setFailed(`exception parsing github context ${e}`);
	}

	let changeBody = {
		'callbackURL': callbackUrl,
		'callbackParams': callbackParams,
		'githubContext': githubContext
	}

	let response;

	core.info("changePayload " + JSON.stringify(changeBody));
	
	try {
		response = await axios.post(sncChangeUrl, changeBody, defaultHeaders);
		console.log("ServiceNow Status: " + response.status + "; Response: " + JSON.stringify(response.data));
	} catch (e) {
		changeBody = JSON.stringify(changeBody);
		core.setFailed(`failed to create change ${e} \nPayload is ${changeBody}`)
		return
	}

})();