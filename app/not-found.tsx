import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="arena-container min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold font-serif">404</h1>
        <h2 className="text-3xl font-serif">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The dialectic you seek does not exist in this realm of thought.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
          <Link href="/fighters">
            <Button variant="outline">Create Dialectic</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

