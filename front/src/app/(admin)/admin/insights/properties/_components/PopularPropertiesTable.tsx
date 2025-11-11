'use client'
'use no memo'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, BarChart3, ExternalLink } from 'lucide-react'
import { Button } from '@ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/table'

interface Property {
  codigo: string
  url: string
  views: number
  favorites: number
  engagementScore: number
}

interface PopularPropertiesTableProps {
  data: Property[]
  onViewFunnel?: (propertyCode: string) => void
}

const columns: ColumnDef<Property>[] = [
  {
    id: 'rank',
    header: '#',
    cell: ({ row }) => (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: 'codigo',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Imóvel
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const codigo = row.getValue('codigo') as string
      const url = row.original.url

      return (
        <div className="space-y-1">
          <div className="font-medium">#{codigo}</div>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <span className="truncate max-w-xs">{url}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">
              URL não disponível
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'views',
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Views
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="text-right">
        {row.getValue<number>('views').toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'favorites',
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Favorites
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="text-right">
        {row.getValue<number>('favorites').toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'engagementScore',
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Engagement Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="text-right">
        <span className="font-semibold">
          {row.getValue<number>('engagementScore').toFixed(1)}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onViewFunnel?: (propertyCode: string) => void
      }
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const propertyCode = row.getValue('codigo') as string
              meta?.onViewFunnel?.(propertyCode)
            }}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Funil
          </Button>
        </div>
      )
    },
  },
]

export function PopularPropertiesTable({
  data,
  onViewFunnel,
}: PopularPropertiesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    meta: {
      onViewFunnel,
    },
  })

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
