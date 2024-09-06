import type { Metadata } from "next";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';

import { MainLayoutContainer } from '@/core/ui'
import { MainMenu } from '@/features/navigation'
import './styles.css';

export const metadata: Metadata = {
  title: "Pokedex",
  description: "Pokemon search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <MainLayoutContainer>
            <MainMenu />

            {children}
          </MainLayoutContainer>
        </ThemeProvider>
      </body>
    </html>
  );
}
