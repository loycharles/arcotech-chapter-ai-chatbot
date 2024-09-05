import { MongoClient } from 'mongodb';

interface VectorSearchConfig {
  database: string;
  collection: string;
}

interface VectorSearch extends VectorSearchConfig {
  index: string;
  embeddings: number[];
}

interface InsertDocument extends VectorSearchConfig {
  documents: {
    text: string;
    embedding: number[];
  }[]
}

export const vectorSearch = async ({ embeddings, ...config }: VectorSearch) => {
  const mongoclient = new MongoClient('mongodb://localhost/?directConnection=true');
  await mongoclient.connect();

  const database = mongoclient.db(config.database);
  const collection = database.collection(config.collection);

  const searchResults = collection.aggregate([
    {
      $vectorSearch: {
        index: config.index,
        path: 'embedding',
        queryVector: embeddings,
        limit: 3,
        numCandidates: 14,
      },
    },
    {
      $project: {
        _id: 0,
        text: 1,
      }
    }
  ]);

  const result = await searchResults.toArray();

  await mongoclient.close();

  const list = result.map((item) => item.text).join('\n');

  return list || 'Nenhum pokemon encontrado';
};

export const insertDocuments = async ({ documents, ...config }: InsertDocument) => {
  const mongoclient = new MongoClient('mongodb://localhost/?directConnection=true');
  await mongoclient.connect();

  const database = mongoclient.db(config.database);
  const collection = database.collection(config.collection);

  const result = await collection.insertMany(documents, { ordered: true });

  await mongoclient.close();

  return { insertedCount: result.insertedCount };
}
