import Image from 'next/image'
import { Inter } from 'next/font/google'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Home from '@/components/Home'
import TranferInfoPage from '@/components/TransferInfo'

const inter = Inter({ subsets: ['latin'] })

export default function index() {
  return (
    <main
    >
      <Home />
    </main>
  )
}
