// Import the Pinecone library
const {Pinecone} = require('@pinecone-database/pinecone');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY});

const chatGPTIndex = pc.index('cohort-chatgpt');

const createMemory = async ({vector, metadata, messageId}) => {
    await chatGPTIndex.upsert([{
      id: messageId,
      values: vector,
      metadata
    }])
}

const queryMemory = async({queryVector, limit=5, metadata}) => {
  const data = await chatGPTIndex.query({
    vector: queryVector,
    topK: limit,
    filter: metadata ? metadata : undefined,
    includeMetadata: true
  });

  return data.matches;
}


module.exports = {createMemory, queryMemory};