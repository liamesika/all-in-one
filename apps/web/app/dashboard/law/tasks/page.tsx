import { Suspense } from 'react';
import { TasksPageClient } from './TasksPageClient';

export const dynamic = 'force-dynamic';

export default function TasksPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksPageClient />
    </Suspense>
  );
}
