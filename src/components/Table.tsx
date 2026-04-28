"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DeleteDialog from "@/components/DeleteDialog";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface TableColumn<T> {
    /** The key of the data field, or 'action' for the actions column */
    key: keyof T | "action";

    /** Column header label */
    label: string;

    /**
     * Tailwind width class or any valid CSS width string.
     * Examples: "w-40", "w-1/4", "min-w-[200px]", "w-[30%]"
     * Defaults to "flex-1" if not provided.
     */
    width?: string;

    /**
     * Minimum width — useful to prevent columns from squishing.
     * Example: "min-w-[120px]"
     */
    minWidth?: string;

    /** Align cell content: left (default) | center | right */
    align?: "left" | "center" | "right";

    /**
     * Custom render function for the cell.
     * If not provided, the raw value is rendered as a string.
     */
    renderCell?: (row: T) => React.ReactNode;

    /**
     * Custom render function for the header cell.
     * If not provided, `label` is used.
     */
    renderHeader?: () => React.ReactNode;
}

export interface TableActionProp<T> {
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
}

export interface TableProps<T> extends TableActionProp<T> {
    columns: TableColumn<T>[];
    data: T[];

    /** Extra classes applied to the outer wrapper */
    className?: string;

    /**
     * Delete dialog configuration.
     * Defaults to generic text if not provided.
     */
    deleteDialog?: {
        buttonLabel?: string;
        title?: string;
        description?: (row: T) => string;
    };

    /** Shown when `data` is empty */
    emptyState?: React.ReactNode;

    /**
     * Row key extractor. Defaults to row index.
     */
    rowKey?: (row: T, index: number) => string | number;

    /**
     * Additional classes per row (e.g. highlight certain rows).
     */
    rowClassName?: (row: T, index: number) => string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
} as const;

function cellWidthClasses<T>(col: TableColumn<T>): string {
    const parts: string[] = [];
    if (col.width) parts.push(col.width);
    else parts.push("flex-1");
    if (col.minWidth) parts.push(col.minWidth);
    return parts.join(" ");
}

// ─────────────────────────────────────────────
// Action tab (edit + delete)
// ─────────────────────────────────────────────

type ActionTabProps<T> = TableActionProp<T> & {
    row: T;
    deleteDialog?: TableProps<T>["deleteDialog"];
};

function ActionTab<T>({ onDelete, onEdit, row, deleteDialog }: ActionTabProps<T>) {
    return (
        <div className="flex justify-center items-center gap-2">
            {onEdit && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                            className="h-8 w-8 cursor-pointer rounded-full p-0 hover:bg-muted"
                        >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                </Tooltip>
            )}

            {onDelete && (
                <DeleteDialog
                    buttonLabel={deleteDialog?.buttonLabel ?? "Delete"}
                    dialogTitle={deleteDialog?.title ?? "Are you sure?"}
                    dialogDescription={
                        deleteDialog?.description
                            ? deleteDialog.description(row)
                            : "This action cannot be undone."
                    }
                    onDelete={() => onDelete(row)}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Table
// ─────────────────────────────────────────────

function Table<T extends Record<string, unknown>>({
    columns,
    data,
    className = "",
    onEdit,
    onDelete,
    deleteDialog,
    emptyState,
    rowKey,
    rowClassName,
}: TableProps<T>) {
    const defaultEmpty = (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed bg-muted/10">
            <p className="text-sm text-muted-foreground">No data available.</p>
        </div>
    );

    return (
        <div className={`w-full ${className}`}>
            {/* ── Header ── */}
            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
                {columns.map((col) => (
                    <div
                        key={String(col.key)}
                        className={`shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground
                            ${cellWidthClasses(col)}
                            ${alignClass[col.align ?? "left"]}`}
                    >
                        {col.renderHeader ? col.renderHeader() : col.label}
                    </div>
                ))}
            </div>

            {/* ── Rows (Scrollable) ── */}
            <div className="mt-2 overflow-auto max-h-[calc(100vh-15rem)] scrollbar-thin">
                {data.length === 0 ? (
                    emptyState ?? defaultEmpty
                ) : (
                    <div className="space-y-2">
                        {data.map((row, rowIndex) => (
                            <div
                                key={rowKey ? rowKey(row, rowIndex) : rowIndex}
                                className={`flex items-center gap-3 rounded-2xl border border-border/70
                                    bg-background px-4 py-3 shadow-sm transition-colors hover:bg-muted/20
                                    ${rowClassName ? rowClassName(row, rowIndex) : ""}`}
                            >
                                {columns.map((col) => (
                                    <div
                                        key={`${rowIndex}-${String(col.key)}`}
                                        className={`shrink-0 min-w-0
                                            ${cellWidthClasses(col)}
                                            ${alignClass[col.align ?? "left"]}`}
                                    >
                                        {col.key === "action" ? (
                                            <ActionTab<T>
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                row={row}
                                                deleteDialog={deleteDialog}
                                            />
                                        ) : col.renderCell ? (
                                            col.renderCell(row)
                                        ) : (
                                            <span className="truncate text-sm text-foreground">
                                                {row[col.key as keyof T] !== undefined &&
                                                row[col.key as keyof T] !== null
                                                    ? String(row[col.key as keyof T])
                                                    : "—"}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Table;

// ─────────────────────────────────────────────
// USAGE EXAMPLE — Project Manager page
// ─────────────────────────────────────────────
//
// import { Ban, CircleCheckBig, Mail, Shield, UserRound } from "lucide-react";
// import Table, { TableColumn } from "@/components/Table";
//
// interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
//   isActive: boolean;
// }
//
// const columns: TableColumn<User>[] = [
//   {
//     key: "name",
//     label: "Name",
//     width: "w-[22%]",           // ← adjust freely
//     minWidth: "min-w-[160px]",
//     renderCell: (user) => (
//       <div className="flex items-center gap-3">
//         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
//           {user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
//         </div>
//         <div className="min-w-0">
//           <p className="truncate text-sm font-semibold">{user.name}</p>
//           <p className="flex items-center gap-1 text-xs text-muted-foreground">
//             <UserRound className="h-3.5 w-3.5" /> Team member
//           </p>
//         </div>
//       </div>
//     ),
//   },
//   {
//     key: "email",
//     label: "Email",
//     width: "w-[30%]",
//     renderCell: (user) => (
//       <p className="flex items-center gap-2 truncate text-sm">
//         <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
//         <span className="truncate">{user.email}</span>
//       </p>
//     ),
//   },
//   {
//     key: "role",
//     label: "Role",
//     width: "w-[15%]",
//     renderCell: (user) => (
//       <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
//         <Shield className="h-3.5 w-3.5" />
//         {user.role === "USER" ? "User" : "Admin"}
//       </div>
//     ),
//   },
//   {
//     key: "isActive",
//     label: "Status",
//     width: "w-[15%]",
//     renderCell: (user) => (
//       <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
//         ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
//         {user.isActive ? <CircleCheckBig className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
//         {user.isActive ? "Active" : "Inactive"}
//       </div>
//     ),
//   },
//   {
//     key: "action",
//     label: "Actions",
//     width: "w-[10%]",
//     align: "center",
//   },
// ];
//
// // In your component:
// <Table<User>
//   columns={columns}
//   data={users}
//   rowKey={(row) => row.id}
//   onEdit={handleUpdateUser}
//   onDelete={handleDeleteUser}
//   deleteDialog={{
//     title: "Delete this Project Manager?",
//     description: (row) => `"${row.name}" will be removed permanently.`,
//   }}
// />