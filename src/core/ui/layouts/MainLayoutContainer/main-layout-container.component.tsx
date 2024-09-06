import styles from './main-layout-container.styles.module.scss'

export const MainLayoutContainer = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    <div className={styles.container}>
      {children}
    </div>
  )
}
