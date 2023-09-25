
import './globals.css'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Providers } from './providers';
import {AppConatiner} from "./appContainer";

const inter = Noto_Sans_JP({ subsets: ['latin'] })
export default function RootLayout({children,}: { children: React.ReactNode }) {


  return (
    <html lang="en">
      <body className={inter.className} style={{overscrollBehaviorY:'none'}} suppressHydrationWarning>
        <Providers>
          <AppConatiner>
            {children}
          </AppConatiner>
        </Providers>
      </body>
    </html>
  )
}
