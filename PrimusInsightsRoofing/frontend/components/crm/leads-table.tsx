'use client'

// PRIMUS HOME PRO - Leads Table Component
// Interactive data grid with TanStack Table (Solar-enhanced)

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import type { LeadWithMeta } from '@/types'
import { LeadDrawer } from './lead-drawer'
import { ScoreBadge, IntentBadge, StageBadge, SolarBadge } from './badges'

interface LeadsTableProps {
  initialLeads: LeadWithMeta[]
}

export function LeadsTable({ initialLeads }: LeadsTableProps) {
  const [selectedLead, setSelectedLead] = useState<LeadWithMeta | null>(null)

  const columns: ColumnDef<LeadWithMeta>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.name || 'Anonymous'}
        </span>
      ),
    },
    {
      header: 'Score',
      accessorKey: 'lastScore',
      cell: ({ row }) => <ScoreBadge score={row.original.lastScore || 0} />,
    },
    {
      header: 'Intent',
      accessorKey: 'lastIntent',
      cell: ({ row }) => (
        <IntentBadge intent={row.original.lastIntent || 'New'} />
      ),
    },
    {
      header: 'Stage',
      accessorKey: 'stage',
      cell: ({ row }) => <StageBadge stage={row.original.stage} />,
    },
    {
      header: 'Solar',
      accessorKey: 'siteSuitability',
      cell: ({ row }) => {
        const lead = row.original as LeadWithMeta & { siteSuitability?: string; solarEnriched?: boolean }
        if (!lead.solarEnriched) return <span className="text-xs text-muted-foreground">—</span>
        return <SolarBadge suitability={lead.siteSuitability || 'NOT_VIABLE'} />
      },
    },
    {
      header: 'Source',
      accessorKey: 'source',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.source}
        </span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  const table = useReactTable({
    data: initialLeads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/50">
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  No leads found. Capture your first lead from a landing page!
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelectedLead(row.original)}
                className="cursor-pointer transition-colors hover:bg-accent/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </>
  )
}
