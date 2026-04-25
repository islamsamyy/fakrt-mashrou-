'use client';

import { useEffect, useState } from 'react';
import { Navbar } from './Navbar';

export function ClientNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-20" />;
  }

  return <Navbar />;
}
