'use client';

import { PropsWithChildren } from 'react';

type CardContainerProps = PropsWithChildren<{ className?: string }>;

export default function CardContainer({
  children,
  className,
}: CardContainerProps) {
  return (
    <div className={`card rounded-none ${className}`}>
      <div className="card-body p-4">{children}</div>
    </div>
  );
}
