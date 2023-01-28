<div align="center">
  <h2>bulk-transfer-github-issues</h2>
</div>

Command line tool to transfer issues from one repo to another on GitHub.

**Does not transfer labels, projects and milestones.**

GitHub token must be seeded as env variable.

#### Run Script

```sh
npm i
export GITHUB_TOKEN=<gh-token>
node index.js -s arunnalla/source -d arunnalla/end
```
