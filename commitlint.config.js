module.exports = {
  extends: ['@commitlint/config-conventional'],
  // ignores [skip ci] so semantic-release can leave long commit messages
  ignores: [message => message.startsWith('WIP'), message => /\[skip ci\]/m.test(message)],
};
