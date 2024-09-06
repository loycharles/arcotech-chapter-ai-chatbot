"use client";

import { useState } from 'react'

import TextareaAutosize from 'react-textarea-autosize'
import axios from 'axios';
import { nanoid } from 'nanoid';

import IconButton from '@mui/material/IconButton';

import Send from '@mui/icons-material/Send';

import { Message } from './components'

import styles from './chat.styles.module.scss'

interface Message {
  id: string
  role: string
  content: string
  pokemon?: string
}

interface ChatProps {
  api?: string
}

export const Chat = ({ api = '/api/groq' }: ChatProps) => {
  const [input, updateInput] = useState('');
  const [messages, updateMessages] = useState<Message[]>([]);
  const [loading, updateLoading] = useState(false);

  const submitPrompt = async () => {
    const prompt = input.trim();

    if (!prompt.trim()) {
      return
    }

    updateLoading(true);
    updateInput('');

    const userMessage = {
      id: nanoid(),
      role: 'user',
      content: prompt,
    };

    updateMessages([
      userMessage,
    ]);

    try {
      const { data } = await axios.post(api, { prompt });

      updateMessages([
        userMessage,
        {
          id: nanoid(),
          role: 'assistant',
          content: data.message,
          pokemon: data.pokemon,
        },
      ]);
    } catch (error) {
      let message = 'Erro desconhecido'
	    if (error instanceof Error) message = error.message

      updateMessages([
        userMessage,
        {
          id: nanoid(),
          role: 'assistant',
          content: message,
        },
      ]);
    } finally {
      updateLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.chat}>
          {messages.map((message) => (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
              pokemon={message.pokemon}
            />
          ))}

          {loading ? (<Message loading />) : null}
        </div>
      </div>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();

          submitPrompt();
        }}
      >
        <TextareaAutosize
          className={styles.input}
          disabled={loading}
          maxRows={6}
          value={input}
          placeholder="Digite a sua mensagem aqui"
          onKeyDown={(event) => {
            if (event.code === 'Enter' && !event.shiftKey) {
              event.preventDefault();

              submitPrompt();
            }
          }}
          onChange={(event) => {
            updateInput(event.target.value);
          }}
        />

        <div>
          <IconButton
            disabled={loading}
            type="submit"
          >
            <Send />
          </IconButton>
        </div>
      </form>
    </main>
  )
}
