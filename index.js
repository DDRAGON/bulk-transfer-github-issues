const { program } = require('commander');

program
  .requiredOption(
    '-s, --source-repo <source-repo>',
    'owner/repo-name of the repository from where the issues should be copied'
  )
  .requiredOption(
    '-d, --destination-repo <destination-repo>',
    'owner/repo-name of the repository to where the issues should be copied'
  )
  .requiredOption('-t, --token <token>', 'GitHub token');

program.parse();

const { sourceRepo, destinationRepo, token } = program.opts();

console.log({ sourceRepo, destinationRepo, token });
