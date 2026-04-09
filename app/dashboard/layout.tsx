import SideNav from '@/app/ui/dashboard/sidenav';
import { auth } from '@/auth';
import { redirect  } from 'next/navigation';
import { getTopPages } from '@/lib/stats';

export default async function Layout({children} : { children: React.ReactNode}){
    const session = await auth();
    if (!session?.user) {
        redirect('/login?callbackUrl=/dashboard');
    }
        const topPages = await getTopPages();

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>

            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <h3>Top pages</h3>
                  <ul>
                    {topPages.map(({ page, views }) => (
                      <li key={page}>{page} — {views} vues</li>
                    ))}
                  </ul>
                </div>
                {children}
            </div>
        </div>
    );
}