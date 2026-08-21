import { AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { MemberRow } from '@/hooks/useAdminData';
import { cn } from '@/lib/utils';

function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' }) : 'never';
}

export function MembersTable({ members, emptyLabel, onSelect }: { members: MemberRow[]; emptyLabel: string; onSelect: (member: MemberRow) => void }) {
  return (
    <div className="border border-outline-variant bg-surface">
      <div className="divide-y divide-outline-variant sm:hidden">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m)}
            className={cn('block w-full p-4 text-left transition-colors active:bg-surface-container-low', m.isStuck && 'bg-error/[0.04]')}
          >
            <span className="flex items-start gap-3">
              <Avatar className={cn(m.isStuck && 'border-error/50 ring-error/10')}>
                <AvatarImage src={m.avatar_url ?? undefined} alt={m.username} />
                <AvatarFallback className="text-xs">{m.username.slice(0, 2)}</AvatarFallback>
                {m.isStuck && <AvatarBadge className="bg-error" aria-label="Needs attention" />}
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-on-surface">{m.username}</span>
                  {m.isStuck && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-error" />}
                </span>
                <span className="mt-1 block font-code text-xs uppercase text-on-surface-variant">{m.cohort ?? 'No cohort'} · {m.inProgressNodes.length || 0} in progress</span>
              </span>
              <span className="font-code text-xs font-semibold text-cyan">{m.overallPct}%</span>
            </span>
            <span className="mt-3 flex items-center gap-3">
              <span className="h-1.5 flex-1 bg-surface-container-high"><span className="block h-full bg-cyan" style={{ width: `${m.overallPct}%` }} /></span>
              <span className={cn('font-code text-xs', m.isStuck ? 'font-semibold text-error' : 'text-on-surface-variant')}>{fmtDate(m.lastActiveAt)}</span>
            </span>
          </button>
        ))}
        {members.length === 0 && <p className="px-4 py-10 text-center font-code text-xs text-outline">{`// ${emptyLabel}`}</p>}
      </div>
      <div className="hidden overflow-x-auto sm:block">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-outline-variant hover:bg-transparent">
            {['member', 'cohort', 'overall', 'in progress', 'last active', ''].map((h) => (
              <TableHead key={h} className="micro-label text-outline">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow
              key={m.id}
              onClick={() => onSelect(m)}
              className={cn('cursor-pointer border-outline-variant/60 hover:bg-surface-container-low/60', m.isStuck && 'bg-error/[0.04]')}
            >
              <TableCell>
                <span className="flex items-center gap-2.5">
                  <Avatar size="sm" className={cn(m.isStuck && 'border-error/50 ring-error/10')}>
                    <AvatarImage src={m.avatar_url ?? undefined} alt={m.username} />
                    <AvatarFallback className="text-[11px]">{m.username.slice(0, 2)}</AvatarFallback>
                    {m.isStuck && <AvatarBadge className="h-3 w-3 bg-error" aria-label="Needs attention" />}
                  </Avatar>
                  <span className="text-xs font-semibold text-on-surface">{m.username}</span>
                  {m.isStuck && <AlertTriangle className="h-3.5 w-3.5 text-error" />}
                </span>
              </TableCell>
              <TableCell className="font-code text-xs uppercase text-on-surface-variant">{m.cohort ?? '—'}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-1 w-20 bg-surface-container-high">
                    <span className="block h-full bg-cyan" style={{ width: `${m.overallPct}%` }} />
                  </span>
                  <span className="font-code text-xs font-semibold text-on-surface-variant">{m.overallPct}%</span>
                </span>
              </TableCell>
              <TableCell className="font-code text-xs text-on-surface-variant">{m.inProgressNodes.length || '—'}</TableCell>
              <TableCell className={cn('font-code text-[11px]', m.isStuck ? 'font-semibold text-error' : 'text-on-surface-variant')}>{fmtDate(m.lastActiveAt)}</TableCell>
              <TableCell className="text-right font-code text-xs uppercase text-outline">view →</TableCell>
            </TableRow>
          ))}
          {members.length === 0 && (
            <TableRow className="border-outline-variant hover:bg-transparent">
              <TableCell colSpan={6} className="py-8 text-center font-code text-xs lowercase text-outline">{`// ${emptyLabel}`}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
