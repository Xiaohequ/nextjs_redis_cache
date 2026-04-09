'use client';
import { useStats } from '@/hooks/useStats';

export default function PageStats(){
      const stats = useStats(3000); // refresh toutes les 3s

      if (!stats) return <p>Chargement...</p>;

      return (<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
       <h3>Top pages</h3>
       <ul>
         {stats.topPages.map(({ page, views }) => (
           <li key={page}>{page} — {views} vues</li>
         ))}
       </ul>
     </div>);
}