import { NextResponse } from 'next/server';
import { getPageViews, getTopPages } from '@/lib/stats';

export async function GET() {

    const  topPages = await getTopPages(10);

  return NextResponse.json({ topPages });
}