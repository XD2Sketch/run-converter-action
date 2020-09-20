const core = require('@actions/core')
const github = require('@actions/github')

const getSha = () => {
  if (github.context.eventName === "pull_request") {
    return github.context.payload.pull_request.head.sha;
  } else {
    return github.context.sha;
  }
}

const postMessage = (body) => {
  const [owner, repo] = core.getInput("repository").split("/");
  const sha = getSha();

  const octokit = github.getOctokit(core.getInput("token"));

  return octokit.repos.createCommitComment({
    owner: owner,
    repo: repo,
    commit_sha: sha,
    body,
  });
}

module.exports = postMessage;
