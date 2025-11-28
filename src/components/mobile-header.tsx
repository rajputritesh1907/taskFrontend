'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="lg:hidden flex h-16 items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <CheckSquare className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          TaskFlow
        </span>
      </Link>

      {/* Mobile Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" asChild>
          <Link href="/tasks/new">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
