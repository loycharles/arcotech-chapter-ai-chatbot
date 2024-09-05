import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const createEmbedding = async (text: string) => {
  const gemini = genAI.getGenerativeModel({
    model: 'text-embedding-004',
    generationConfig: {
      temperature: 0,
    },
  });

  const { embedding } = await gemini.embedContent(text);

  return embedding.values;
};

export const createEmbeddings = async (texts: string[]) => {
  const gemini = genAI.getGenerativeModel({
    model: 'text-embedding-004',
    generationConfig: {
      temperature: 0,
    },
  });

  const embeddings: number[][] = [];

  for (const text of texts) {
    const { embedding } = await gemini.embedContent(text);

    embeddings.push(embedding.values);
  }

  return embeddings;
};
