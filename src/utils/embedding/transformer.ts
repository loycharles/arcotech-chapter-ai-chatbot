import { pipeline, env } from '@xenova/transformers';

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = process.cwd() + '/public/models/';
env.cacheDir = process.cwd() + '/public/.cache/';

export const createEmbedding = async (text: string) => {
  const extractor = await pipeline('feature-extraction', 'all-MiniLM-L6-v2', {
    local_files_only: true,
  });

  const embedding = await extractor(text, { pooling: 'mean', normalize: true });

  return Array.from(embedding.data);
}

export const createEmbeddings = async (texts: string[]) => {
  const extractor = await pipeline('feature-extraction', 'all-MiniLM-L6-v2', {
    local_files_only: true,
  });

  const embeddings: number[][] = [];

  for (const text of texts) {
    const embedding = await extractor(text, { pooling: 'mean', normalize: true });

    embeddings.push(Array.from(embedding.data));
  }

  return embeddings;
}
