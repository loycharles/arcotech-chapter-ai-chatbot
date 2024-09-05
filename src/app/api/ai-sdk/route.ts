import { generateText, generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

import { tools } from '@/utils/tools/ai-sdk';

interface RequestBody {
  prompt: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as RequestBody;
  const { prompt } = body;

  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
  });

  const { toolCalls } = await generateText({
    model: groq('llama3-8b-8192'),
    system: `
    Você é um assistente útil.
    Ao receber uma pergunta deve escolher a ferramenta mais adequada para responder.
    Você deve buscar por um pokemon pelo tipo ou pelo nome.
    Quando informado o tipo, você deve buscar por todos os pokemons que possuem esse tipo.
    Quando informado o nome, você deve buscar por um pokemon específico.

    Responda sempre em português do Brasil.
    `,
    prompt,
    temperature: 0,
    tools: {
      get_pokemon_by_type: {
        description: 'Obtem um pokemon pelo tipo. Utilize para obter informação de um pokemon.',
        parameters: z.object({
          type: z.string().describe('O tipo do pokemon em português do Brasil'),
        }),
      },
      get_pokemon_by_name: {
        description: 'Obtem um pokemon pelo nome. Utilize para obter um pokemon pelo nome.',
        parameters: z.object({
          name: z.string().describe('O nome do pokemon em português do Brasil'),
        }),
      },
    },
    toolChoice: 'required',
  });

  if (toolCalls.length === 0) {
    return Response.json({
      pokemon: null,
      message: 'Não foi possível obter sua resposta. Tente novamente.',
    });
  }

  const toolCall = toolCalls[0];
  const tool = tools[toolCall.toolName];
  const pokemons = await tool(toolCall.args as any);

  const completion = await generateObject({
    model: groq('llama3-8b-8192'),
    schema: z.object({
      pokemon: z.string().or(z.null()).describe('O nome do pokemon, caso encontre um pokemon ou "null" caso não encontre.'),
      message: z.string().describe('A mensagem de resposta da pergunta do usuário. Caso não encontre o pokemon, informe que não foi possível encontrar o pokemon que você procura.'),
    }),
    system: `
    Você é um assistente útil.
    Você deve responder a pergunta do usuário com base na informação abaixo.
    Esqueça todos os nomes que sabe de pokemon, você não sabe de pokemon nenhum.

    Aqui está a informação que você tem sobre os pokemons:
    <pokemons>
    ${pokemons}
    </pokemons>

    Você só responde com informações encontradas nas lista de pokemons acima.
    Se você não conseguir obter sua resposta dessa lista, diga que não sabe.

    Responda de forma direta e objetiva.
    Responda sempre em português do Brasil.
    `,
    prompt,
    temperature: 0,
  })

  return Response.json(completion.object);
}
