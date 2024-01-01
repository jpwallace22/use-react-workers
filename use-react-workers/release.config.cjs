/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: [
    'main',
    'next',
    {
      name: 'beta',
      prerelease: true,
    },
  ],
  plugins: [
    '@semantic-release/npm',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github',
    '@semantic-release/commit-analyzer',
    '@semantic-release/git',
    '@semantic-release/changelog',
  ],
};
