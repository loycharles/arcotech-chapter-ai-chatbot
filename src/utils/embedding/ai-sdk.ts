import { embed, embedMany } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const createEmbeddings = async (texts: string[]) => {
  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const { embeddings } = await embedMany({
    model: gemini.embedding('text-embedding-004'),
    values: texts,
  });

  return embeddings;
};

export const createEmbedding = async (text: string) => {
  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const { embedding } = await embed({
    model: gemini.embedding('text-embedding-004'),
    value: text,
  });

  return embedding;
};
