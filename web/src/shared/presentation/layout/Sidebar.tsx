'use client';

/**
 * Sidebar del Dashboard
 *
 * - Colapsable
 * - Menús dinámicos desde configuración
 * - Extensible para nuevos módulos
 * - Estilo brutalista industrial
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mainMenu, secondaryMenu } from '../navigation/menu.config';
import { SidebarItem } from './SidebarItem';
import { cn } from '../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'border-r-2 border-foreground bg-card',
        'flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="h-20 border-b-2 border-foreground flex items-center justify-center px-4">
        <span
          className={cn(
            'font-black tracking-widest transition-all duration-300',
            collapsed ? 'text-lg' : 'text-3xl',
          )}
        >
          SOTEK
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4">
        {mainMenu.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-border py-4">
        {secondaryMenu.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} />
        ))}
      </div>

      {/* Collapse Button */}
      <div className="p-4 border-t-2 border-foreground">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center justify-center',
            'h-9 px-3 text-sm font-medium',
            'border border-input bg-background',
            'hover:bg-accent hover:text-accent-foreground',
            'transition-colors',
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
