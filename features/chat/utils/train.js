const { dockStart } = require('@nlpjs/basic');

async function trainAI(str) {
  const dock = await dockStart({ use: ['Basic'] });
  const manager = dock.get('nlp');
  await manager.addCorpus(`${__dirname}/tset-en.json`);
  await manager.train();
  return await manager.process('en', str);
}

module.exports = { trainAI };
