import { createEmbedding } from '@/utils/embedding/transformer';
import { vectorSearch } from '@/utils/database/mongodb';

export const tools = {
  get_pokemon_by_type: async ({ type }: { type: string }) => {
    const query = `Pokemons do tipo ${type}`;

    const embedding = await createEmbedding(query);

    const results = await vectorSearch({
      embeddings: embedding,
      database: 'pokedex',
      collection: 'pokemons_transformerjs',
      index: 'search_dot_product',
    });

    return results;
  },
  get_pokemon_by_name: async ({ name }: { name: string }) => {
    const query = `Pokemons com o nome ${name}`;

    const embedding = await createEmbedding(query);

    const results = await vectorSearch({
      embeddings: embedding,
      database: 'pokedex',
      collection: 'pokemons_transformerjs',
      index: 'search_cosine',
    });

    return results;
  },
};
