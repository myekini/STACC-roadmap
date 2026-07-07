import { AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MemberRow } from '@/hooks/useAdminData';
import { cn } from '@/lib/utils';

function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' }) : 'never';
}

export function MembersTable({ members, emptyLabel, onSelect }: { members: MemberRow[]; emptyLabel: string; onSelect: (member: MemberRow) => void }) {
  return (
    <div className="overflow-x-auto border border-outline-variant bg-surface">
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
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden border border-outline-variant bg-surface-container-low font-code text-[10px] font-bold uppercase text-on-surface-variant">
                    {m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      m.username.slice(0, 2)
                    )}
                  </span>
                  <span className="text-xs font-semibold text-on-surface">{m.username}</span>
                  {m.isStuck && <AlertTriangle className="h-3.5 w-3.5 text-error" />}
                </span>
              </TableCell>
              <TableCell className="font-code text-[10px] uppercase text-on-surface-variant">{m.cohort ?? '—'}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-1 w-20 bg-surface-container-high">
                    <span className="block h-full bg-cyan" style={{ width: `${m.overallPct}%` }} />
                  </span>
                  <span className="font-code text-[10px] font-semibold text-on-surface-variant">{m.overallPct}%</span>
                </span>
              </TableCell>
              <TableCell className="font-code text-xs text-on-surface-variant">{m.inProgressNodes.length || '—'}</TableCell>
              <TableCell className={cn('font-code text-[11px]', m.isStuck ? 'font-semibold text-error' : 'text-on-surface-variant')}>{fmtDate(m.lastActiveAt)}</TableCell>
              <TableCell className="text-right font-code text-[10px] uppercase text-outline">view →</TableCell>
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
  );
}
