import { Metadata } from 'next';
import { headers } from 'next/headers';
import { trackPageView, trackPopularPage } from '@/lib/stats';

export const metadata : Metadata = {
    title : 'Customers'
};

export default async function Page() {
        const headersList = await headers();
       const userAgent = headersList.get('user-agent') || '';
       const isBot = /bot|crawler|spider|googlebot/i.test(userAgent);
       if (!isBot) {
         await trackPageView(`/dashboard/customers`);
         await trackPopularPage(`/dashboard/customers`);
       }
       
  return <p>Customers Page</p>;
}