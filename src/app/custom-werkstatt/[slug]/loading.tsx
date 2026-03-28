import Header from '@/components/layout/Header'

export default function BuilderProfileLoading() {
  return (
    <>
      <Header activePage="custom-werkstatt" />
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2AABAB] border-t-transparent" />
      </div>
    </>
  )
}
