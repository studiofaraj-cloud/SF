import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="grid gap-1">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="ml-auto flex items-center gap-2">{children}</div>}
    </div>
  );
}
