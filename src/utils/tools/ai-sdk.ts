import { createEmbedding } from '@/utils/embedding/ai-sdk';
import { vectorSearch } from '@/utils/database/mongodb';

export const tools = {
  get_pokemon_by_type: async (type: string) => {
    console.log('get_pokemon_by_type', type);
    const query = `Pokemons do tipo ${type}`;

    const embedding = await createEmbedding(query);

    const results = await vectorSearch({
      embeddings: embedding,
      database: 'pokedex',
      collection: 'pokemons_ai_sdk',
      index: 'search_dot_product',
    });

    return results;
  },
  get_pokemon_by_name: async (name: string) => {
    console.log('get_pokemon_by_name', name);
    const query = `Pokemons com o nome ${name}`;

    const embedding = await createEmbedding(query);

    const results = await vectorSearch({
      embeddings: embedding,
      database: 'pokedex',
      collection: 'pokemons_ai_sdk',
      index: 'search_cosine',
    });

    return results;
  },
};
