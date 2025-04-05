import StreamVideoProvider from '@/providers/StreamClientProvider'
import { Metadata } from 'next';
import React, { Children, ReactNode } from 'react'
export const metadata: Metadata = {
  title: "VideoStreamingApp",
  description: "A video caling Platform",
  icons:{
    icon:'/icons/logo.svg'
  }
};
const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main>
      <StreamVideoProvider>
        {children}
      </StreamVideoProvider>
    </main>
  )
}

export default RootLayout