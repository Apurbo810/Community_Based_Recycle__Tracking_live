'use client';

export const dynamic = 'force-dynamic';

import Header from '@/app/components/Header';
import HomeClient from './components/ClientSlider';

export default function Home() {
  return (
    <>
      <Header />
      <HomeClient />
    </>
  );
}
