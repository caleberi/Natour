const { NlpManager } = require('node-nlp');
const nplConfiguration = { nlu: { log: true }, languages: ['en'] };
const manager = new NlpManager(nplConfiguration);

async function trainAI(str) {
  await manager.addCorpus('./tset-en.json');
  await manager.train();
  return await manager.process('en', str);
}

module.exports = { trainAI };
