import ollama from 'ollama';

import { tools } from '@/utils/tools/transformer';

interface RequestBody {
  prompt: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as RequestBody;
  const { prompt } = body;

  const toolModel = await ollama.chat({
    model: 'llama3.1:8b-instruct-q4_0',
    options: {
      temperature: 0,
    },
    messages: [
      {
        role: 'system',
        content: `
        Você é um assistente útil.
        Ao receber uma pergunta deve escolher a ferramenta mais adequada para responder.
        Você deve buscar por um pokemon pelo tipo ou pelo nome.
        Quando informado o tipo, você deve buscar por todos os pokemons que possuem esse tipo.
        Quando informado o nome, você deve buscar por um pokemon específico.

        Responda sempre em português do Brasil.
        `
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_pokemon_by_type',
          description: 'Obtem um pokemon pelo tipo. Utilize para obter informação de um pokemon.',
          parameters: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'O tipo do pokemon em português do Brasil'
              }
            },
            required: ['type'],
          },
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_pokemon_by_name',
          description: 'Obtem um pokemon pelo nome. Utilize para obter um pokemon pelo nome.',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'O nome do pokemon em português do Brasil'
              }
            },
            required: ['name'],
          },
        }
      }
    ],
  });

  const toolCalls = toolModel.message.tool_calls || [];

  if (toolCalls.length === 0) {
    return Response.json({
      pokemon: null,
      message: 'Não foi possível obter sua resposta. Tente novamente.',
    });
  }

  const call = toolCalls[0];
  const tool = tools[call.function.name as keyof typeof tools];
  const pokemons = await tool(call.function.arguments as any);

  const completion = await ollama.chat({
    model: 'llama3.1:8b-instruct-q4_0',
    options: {
      temperature: 0,
    },
    stream: false,
    format: 'json',
    messages: [
      {
        role: 'system',
        content: `
        Você é um assistente útil.
        Você deve responder a pergunta do usuário com base na informação abaixo.
        Esqueça todos os nomes que sabe de pokemon, você não sabe de pokemon nenhum.

        Aqui está a informação que você tem sobre os pokemons:
        <pokemons>
        ${pokemons}
        </pokemons>

        Você só responde com informações encontradas nas lista de pokemons acima.
        Se você não conseguir obter sua resposta dessa lista, diga que não sabe.

        Responda sempre em português do Brasil.

        A mensagem de não encontrado deve ser "Não foi possível encontrar um pokemon com essas informações."

        Utilize o schema abaixo para responder a pergunta do usuário.
        Responda sempre em JSON.
        {
          "pokemon": "Nome do pokemon ou null. Campo obrigatório.",
          "message": "Mensagem de resposta ou 'Não foi possível encontrar a resposta.' Campo obrigatório."
        }
        `
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  try {
    const message = JSON.parse(completion.message.content);

    return Response.json(message);
  } catch (error) {
    return Response.json({
      pokemon: null,
      message: 'Não foi possível obter sua resposta. Tente novamente.',
    });
  }
}