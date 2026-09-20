import { Button } from '@/components/ui/button'
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Header() {
    return (
        <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
            <div className="flex items-center gap-2">
                <Image src={'/logo.svg'} alt='logo' width={40} height={40} />
                <h1 className="text-base font-bold md:text-2xl">AI Mock Interview</h1>
            </div>
            <div className="flex items-center gap-3">
                <SignedOut>
                    <SignInButton mode="modal">
                        <Button variant="outline">Sign In</Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <Button>Get Started</Button>
                    </SignUpButton>
                </SignedOut>
                <SignedIn>
                    <Link href={'/dashboard'}>
                        <Button size={'default'} variant="outline">Dashboard</Button>
                    </Link>
                    <UserButton />
                </SignedIn>
            </div>
        </nav>
    )
}

export default Header