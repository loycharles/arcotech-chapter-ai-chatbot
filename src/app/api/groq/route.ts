import Groq from 'groq-sdk';

interface RequestBody {
  prompt: string;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const body = (await req.json()) as RequestBody;
  const { prompt } = body;

  const response = await groq.chat.completions.create({
    model: 'llama3-groq-8b-8192-tool-use-preview',
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
    tool_choice: 'required',
  });

  return Response.json(response);
}
