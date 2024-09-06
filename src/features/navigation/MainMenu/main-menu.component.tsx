'use client';

import { useRouter, usePathname } from 'next/navigation';

import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import SmartToy from '@mui/icons-material/SmartToy';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';

const pages = [
  {
    title: 'Chapter',
    path: '/',
  },
  {
    title: 'GROQ',
    path: '/groq',
  },
  {
    title: 'GEMINI',
    path: '/gemini',
  },
  {
    title: 'AI SDK',
    path: '/ai-sdk',
  },
  {
    title: 'OLLAMA',
    path: '/ollama',
  },
];

export const MainMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

  console.log(pathname);

  return (
    <AppBar position="fixed">
      <Container>
        <Toolbar disableGutters>
          <SmartToy />

          <Box sx={{ flexGrow: 1 }} />

          <Stack spacing={2} direction="row">
            {pages.map((page) => (
              <Button
                key={page.title}
                disableElevation
                variant="contained"
                size="small"
                startIcon={pathname === page.path ? <ChatBubbleOutline /> : null}
                onClick={() => router.push(page.path)}
              >
                {page.title}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}