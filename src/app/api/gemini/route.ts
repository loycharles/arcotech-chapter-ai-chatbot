import { GoogleGenerativeAI, SchemaType, FunctionCallingMode } from '@google/generative-ai';

import { tools } from '@/utils/tools/gemini';

interface RequestBody {
  prompt: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  const body = (await req.json()) as RequestBody;
  const { prompt } = body;

  const toolModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0,
    },
    tools: [
      {
        functionDeclarations: [
          {
            name: 'get_pokemon_by_type',
            parameters: {
              type: SchemaType.OBJECT,
              description: 'Obtem um pokemon pelo tipo. Utilize para obter informação de um pokemon.',
              properties: {
                type: {
                  type: SchemaType.STRING,
                  description: 'O tipo do pokemon em português do Brasil'
                }
              },
              required: ['type'],
            },
          },
          {
            name: 'get_pokemon_by_name',
            parameters: {
              type: SchemaType.OBJECT,
              description: 'Obtem um pokemon pelo nome. Utilize para obter um pokemon pelo nome.',
              properties: {
                name: {
                  type: SchemaType.STRING,
                  description: 'O nome do pokemon em português do Brasil'
                }
              },
              required: ['name'],
            },
          }
        ]
      }
    ],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.ANY,
      },
    },
    systemInstruction: `
    Você é um assistente útil.
    Ao receber uma pergunta deve escolher a ferramenta mais adequada para responder.
    Você deve buscar por um pokemon pelo tipo ou pelo nome.
    Quando informado o tipo, você deve buscar por todos os pokemons que possuem esse tipo.
    Quando informado o nome, você deve buscar por um pokemon específico.

    Responda sempre em português do Brasil.
    `
  });

  const chat = toolModel.startChat();

  const { response: { functionCalls } } = await chat.sendMessage(prompt);

  const calls = functionCalls();

  if (!calls || calls?.length === 0) {
    return Response.json({
      pokemon: null,
      message: 'Não foi possível obter sua resposta. Tente novamente.',
    });
  }

  const call = calls[0];
  const tool = tools[call.name as keyof typeof tools];
  const pokemons = await tool(call.args as any);

  const completion = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          pokemon: {
            type: SchemaType.STRING,
            description: 'O nome do pokemon, caso encontre um pokemon ou "null" caso não encontre.',
          },
          message: {
            type: SchemaType.STRING,
            description: 'A mensagem de resposta da pergunta do usuário. Caso não encontre o pokemon, informe que não foi possível encontrar o pokemon que você procura.',
          }
        },
        required: ['pokemon', 'message'],
      }
    },
    systemInstruction: `
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
    `
  });

  const result = await completion.generateContent(prompt);

  return Response.json(JSON.parse(result.response.text()));
}
