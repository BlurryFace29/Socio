'use client';

export default function Name({
  name
}: {
  name: string;
}) {
  return <>{name || ''}</>;
}