"use client"
import { useId } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Button } from './ui/button'
import { Trash2Icon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

function DeleteDialog({ 
  buttonLabel, 
  dialogTitle, 
  dialogDescription, 
  onDelete,
  disabled = false,
  disabledMessage 
}: { 
  buttonLabel: string
  dialogTitle: string
  dialogDescription: string
  onDelete: () => void
  disabled?: boolean
  disabledMessage?: string
}) {
    const id = useId()
    return (
        <div suppressHydrationWarning>
            <AlertDialog key={id}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className='m-0! p-0! hover:bg-transparent cursor-pointer'>
                                <Trash2Icon className='text-red-600 m-0! p-0! size-4.5' />
                            </Button>
                        </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        {buttonLabel}
                    </TooltipContent>
                </Tooltip>
                <AlertDialogContent size="sm" onCloseAutoFocus={(e) => e.preventDefault()} className='min-w-[400px]'>
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                        </AlertDialogMedia>
                        <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogDescription}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {disabled && disabledMessage && (
                        <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                            {disabledMessage}
                        </div>
                    )}
                    <AlertDialogFooter className='gap-4'>
                        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            variant="destructive" 
                            onClick={onDelete}
                            disabled={disabled}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}

export default DeleteDialog;
