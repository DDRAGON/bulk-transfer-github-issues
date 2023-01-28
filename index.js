const { program } = require('commander');
const { Octokit } = require('octokit');

/**
 * Command line interface options definition
 */
program
  .requiredOption(
    '-s, --source-repo <source-repo>',
    'owner/repo-name of the repository from where the issues should be copied'
  )
  .requiredOption(
    '-d, --destination-repo <destination-repo>',
    'owner/repo-name of the repository to where the issues should be copied'
  );

program.parse();

/**
 * Throw error if the token does not exist
 */
if (!process.env.GITHUB_TOKEN) {
  throw Error('Missing GitHub token');
}

const { sourceRepo, destinationRepo } = program.opts();
const [sourceOwnerName, sourceRepoName] = sourceRepo.split('/');
const [destinationOwnerName, destinationRepoName] = destinationRepo.split('/');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Get source repo issue ids
 */
const GET_SOURCE_REPO_ISSUES_QUERY = `query ($owner: String!, $name: String!, $after: String) {
  repository(owner: $owner, name: $name) {
    id,
    issues(first: 100, after: $after) {
      nodes {
        id
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`;

const getIssueIds = async () => {
  let hasNextPage = true;
  let after = null;

  const issues = [];
  while (hasNextPage) {
    const resultSource = await octokit.graphql(GET_SOURCE_REPO_ISSUES_QUERY, {
      owner: sourceOwnerName,
      name: sourceRepoName,
      after,
    });
    sourceRepoId = resultSource.repository.id;
    issues.push(
      resultSource.repository.issues.nodes.map((element) => element.id)
    );
    hasNextPage = resultSource.repository.issues.pageInfo.hasNextPage;
    after = resultSource.repository.issues.pageInfo.endCursor;
  }
  return issues.flat(1);
};

/**
 * Get destination repo id
 */
const GET_DESTINATION_REPO_ID_QUERY = `query ($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    id,
    name
  }
}`;

const getDestinationRepoId = async () => {
  const destination = await octokit.graphql(GET_DESTINATION_REPO_ID_QUERY, {
    owner: destinationOwnerName,
    name: destinationRepoName,
  });
  return destination.repository.id;
};

/**
 * Migrate issue
 */
const MIGRATE_ISSUE_MUTATION = `mutation ($issueId: ID!, $repositoryId: ID!) {
  transferIssue(input: {issueId: $issueId, repositoryId: $repositoryId}) {
    issue {
      url
      number
    }
  }
}`;

const transferIssue = async (issueId, repositoryId) => {
  const response = await octokit.graphql(MIGRATE_ISSUE_MUTATION, {
    issueId,
    repositoryId,
  });
  console.log(JSON.stringify(response));
};

(async () => {
  try {
    const destinationRepoId = await getDestinationRepoId();
    const issueIds = await getIssueIds();

    for (const issueId of issueIds) {
      await transferIssue(issueId, destinationRepoId);
    }
  } catch (e) {
    console.log(e);
  }
})();
