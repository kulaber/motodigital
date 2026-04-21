import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import LoginForm from './LoginForm'
import RegisterCarousel from '../register/RegisterCarousel'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth')
  return { title: t('loginPageTitle') }
}

export default async function LoginPage() {
  const t = await getTranslations('Auth')

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#111111] text-white flex flex-col lg:flex-row">

      {/* Left — Visual showcase (desktop) */}
      <div className="hidden lg:flex lg:flex-[1.2] flex-col relative overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(6,165,165,0.07) 0%, transparent 70%)' }} />

        {/* Logo — top left above slider */}
        <div className="relative pt-10 pl-10">
          <Link href="/">
            <Image src="/logo.svg" alt="MotoDigital" width={300} height={110}
              className="h-16 w-auto" priority />
          </Link>
        </div>

        {/* Carousel fills remaining space */}
        <div className="flex-1 flex items-center justify-center">
          <RegisterCarousel />
        </div>
      </div>

      {/* Right — Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 overflow-y-auto relative">
        <div className="absolute inset-0 pointer-events-none lg:hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(6,165,165,0.05) 0%, transparent 60%)' }} />

        <div className="w-full max-w-sm flex flex-col items-center py-10 relative">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden">
            <Image src="/logo.svg" alt="MotoDigital" width={300} height={110}
              className="h-12 sm:h-16 w-auto" priority />
          </Link>

          {/* Mobile illustration */}
          <div className="lg:hidden mt-6">
            <Image src="/rider.png" alt="" width={200} height={150} className="w-44 h-auto" />
          </div>

          {/* Headline */}
          <h1 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold mt-6 lg:mt-10 text-center leading-tight">
            {t('welcomeBack')}
          </h1>
          <p className="text-sm text-white/35 mt-2 mb-6 lg:mb-8 text-center">
            {t('loginPageSubtitle')}
          </p>

          {/* Form */}
          <div className="w-full">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <LoginForm />
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-white/35 mt-5">
            {t('noAccountCta')}{' '}
            <Link href="/auth/register" className="text-white/60 hover:text-[#06a5a5] transition-colors">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
