const core = require('@actions/core');
const axios = require('axios');

(async function main() {
	const instanceName = core.getInput('instance-name', { required: true });
	const toolId = core.getInput('tool-id', { required: true });
	const username = core.getInput('devops-integration-user-name', { required: true });
	const pass = core.getInput('devops-integration-user-pass', { required: true });
	const defaultHeaders = { 'Content-Type': 'application/json' };

	const sncChangeUrl = `https://${username}:${pass}@${instanceName}.service-now.com/api/sn_devops/devops/orchestration/changeControl?toolId=${toolId}&toolType=github`;

	const callbackUrl = core.getInput('callback', { required: true });

	let githubContext = core.getInput('context-github', { required: true })

	try {
	    githubContext = JSON.parse(githubContext);
	} catch (e) {
	    core.setFailed(`exception parsing github context ${e}`);
	}

	let html_url = githubContext.event.repository.html_url;
	let orchestrationTaskUrl = githubContext.workflow.trim().replace(" ", "+")

	let changeBody = {
		'callbackURL': callbackUrl,
		'orchestrationTaskURL': `${html_url}/actions/?query=workflow:\\"${orchestrationTaskUrl}\\"`,
		'orchestrationTaskDetails': {
			'triggerType': 'upstream',
			'upstreamTaskExecutionURL': `${html_url}/actions/runs/${githubContext.run_id}`
		    }
	}

	let changePayload;

	core.debug("changePayload " + JSON.stringify(changeBody));
	core.info("changePayload " + JSON.stringify(changeBody));
	console.log("still testing changePayload " + JSON.stringify(changeBody));
	try {
		changePayload = await axios.post(sncChangeUrl, changeBody, defaultHeaders);
	} catch (e) {
		changeBody = JSON.stringify(changeBody);
		core.setFailed(`failed to create artifact package ${e} \nPayload is ${changeBody}`)
		return
	}

})();