import './globals.css'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Providers } from './providers';
import {AppConatiner} from "./appContainer";

const noto = Noto_Sans_JP({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-noto-sans-jp',
});
export const metadata = {
    title: 'タイトル',
    description: '説明...',
}

export default function RootLayout({children,}: { children: React.ReactNode }) {


  return (
    <html lang="en" className={'overflow-hidden'}>
      <body className={`font-body ${noto.className}`} style={{overscrollBehaviorY:'none', WebkitOverflowScrolling: 'touch',}} suppressHydrationWarning>
        <Providers>
          <AppConatiner>
            {children}
          </AppConatiner>
        </Providers>
      </body>
    </html>
  )
}
