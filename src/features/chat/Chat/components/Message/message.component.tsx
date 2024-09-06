import classNames from 'classnames'

import Avatar from '@mui/material/Avatar';

import SmartToy from '@mui/icons-material/SmartToy';

import styles from './message.styles.module.scss'

interface MessageProps {
  role?: string
  content?: string | React.ReactNode
  loading?: boolean
  pokemon?: string
}

const pokemons = {
  bulbassauro: '/assets/images/pokemons/bulbassauro.webp',
  caterpie: '/assets/images/pokemons/caterpie.webp',
  charmander: '/assets/images/pokemons/charmander.webp',
  ditto: '/assets/images/pokemons/ditto.webp',
  ekans: '/assets/images/pokemons/ekans.webp',
  machamp: '/assets/images/pokemons/machamp.webp',
  pidgey: '/assets/images/pokemons/pidgey.webp',
  pikachu: '/assets/images/pokemons/pikachu.webp',
  psyduck: '/assets/images/pokemons/psyduck.webp',
  rattata: '/assets/images/pokemons/rattata.webp',
  sandshrew: '/assets/images/pokemons/sandshrew.webp',
  squirtle: '/assets/images/pokemons/squirtle.webp',
  voltorb: '/assets/images/pokemons/voltorb.webp',
  zubat: '/assets/images/pokemons/zubat.webp',
}

export const Message = ({ role, content, loading, pokemon }: MessageProps) => {
  const isUser = role === 'user'
  const pokemonName = String(pokemon).toLowerCase();

  return (
    <div
      className={classNames(
        styles.message,
        { [styles.user]: isUser },
      )}
    >
      {!isUser ? (
        <Avatar
          sx={{ width: 32, height: 32 }}
        >
          <SmartToy />
        </Avatar>
      ) : null}

      {loading ? (
        <img
          alt="Digitando..."
          className={styles.typing}
          src="/assets/images/typing.gif"
        />
      ) : (
        <div className={styles.content}>{content}</div>
      )}

      {pokemon && pokemons[pokemonName as keyof typeof pokemons] ? (
        <img
          alt={pokemon}
          className={styles.pokemon}
          src={pokemons[pokemonName as keyof typeof pokemons]}
        />
      ) : null}
    </div>
  )
}
