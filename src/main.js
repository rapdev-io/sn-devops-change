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
	let callbackParams = core.getInput('callback-params', { required: false });

	if(callbackParams) {
		try {
			callbackParams = JSON.parse(callbackParams);
		} catch (e) {
			core.setFailed(`exception parsing callbackParams ${e}`);
		}
	}
	else {
		callbackParams = {};
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
		core.setFailed(`failed to create artifact package ${e} \nPayload is ${changeBody}`)
		return
	}

})();