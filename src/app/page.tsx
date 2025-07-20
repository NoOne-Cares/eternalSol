"use client"
import Hero from '@/components/dashboard/dashboard-feature'
import { useTheme } from 'next-themes';
import { ToastContainer } from 'react-toastify';
export default function Home() {
  const { theme } = useTheme()
  return <div >
    <Hero />
    <ToastContainer
      position="top-right"
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  </div>
}
