export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-slate/20 rounded-full blur-[128px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-[128px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}