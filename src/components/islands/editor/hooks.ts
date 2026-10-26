/**
 * What the editing islands on a page share: the visitor's editor status and the site's open edits, each read once
 * per page from the control plane and only for members (everyone else never asks). `null` until known.
 */
import * as React from 'react';
import { useMe } from '@/lib/control';
import { getPending, getStatus, type EditorStatus, type Pending } from '@/lib/editor';

let statusPromise: Promise<EditorStatus | null> | null = null;
let pendingPromise: Promise<Pending[]> | null = null;

function shared<T>(load: () => Promise<T> | null, enabled: boolean): T | null {
  const [value, set] = React.useState<T | null>(null);
  React.useEffect(() => {
    if (!enabled) return;
    let live = true;
    load()?.then((v) => live && set(v));
    return () => {
      live = false;
    };
  }, [enabled, load]);
  return value;
}

const loadStatus = () => (statusPromise ??= getStatus().catch(() => null));
const loadPending = () => (pendingPromise ??= getPending().catch(() => []));

/** The visitor as an editor; null until known, and for anyone who is not a member. */
export function useEditorStatus(): EditorStatus | null {
  const me = useMe();
  return shared(loadStatus, !!me?.member);
}

/** Every open edit in the site repo; empty until known (and for anyone who may not edit). */
export function usePending(enabled: boolean): Pending[] {
  return shared(loadPending, enabled) ?? [];
}
