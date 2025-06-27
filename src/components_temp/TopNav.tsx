'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';

export function TopNav() {
    const pathname = usePathname();

    // temporary logic, should implement authen logic for nav
    if (pathname === '/login') return null;

    const { data: session, status } = useSession();
    const [hasStudyPlan, setHasStudyPlan] = useState<boolean>(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email) {
            setHasStudyPlan(true);
        }
    }, [session, status]);

    return (
        <div className="">
            <div className="px-2 pt-2">
                <p className="text-2xl font-extrabold">
                    Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0 Build20250611
                </p>
            </div>

            <div className="flex flex-row justify-between px-2">
                <div className="">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-2xl font-extrabold">
                            Class Room EP105
                        </p>

                        {session?.user?.username ? (
                            <>
                                <p className="text-2xl">
                                    Welcome, {session.user.username}!
                                </p>

                                <Button
                                    variant="outline"
                                    onClick={() => signOut()}
                                >
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="default"
                                onClick={() => signIn('google')}
                            >
                                Sign In with Google
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap content-end justify-end gap-2">
                    <Link href="/room-announcement">
                        <Button variant="ghost">Room Announcement</Button>
                    </Link>

                    <Link href="/login">
                        <Button variant="outline">Manage Due</Button>
                    </Link>

                    <Link href="/">
                        <Button variant="secondary">Work on Due Report</Button>
                    </Link>

                    {hasStudyPlan && (
                        <Link href="/my-student-plan">
                            <Button>My Study Plan</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
