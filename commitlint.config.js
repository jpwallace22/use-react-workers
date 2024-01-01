module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [message => message.startsWith('WIP'), message => /\[skip ci\]/m.test(message)],
};
