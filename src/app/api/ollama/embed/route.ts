import { promises as fs } from 'fs';

import { createEmbeddings } from '@/utils/embedding/transformer';
import { insertDocuments } from '@/utils/database/mongodb';

export async function POST() {
  const file = await fs.readFile(process.cwd() + '/src/data/pokemons.txt', 'utf8');

  const chunks = file.split('\n').filter(Boolean);

  const embeddings = await createEmbeddings(chunks);

  const { insertedCount } = await insertDocuments({
    database: 'pokedex',
    collection: 'pokemons_transformerjs',
    documents: chunks.map((chunk, index) => ({
      text: chunk,
      embedding: embeddings[index],
    })),
  });

  return Response.json({ insertedCount });
}
