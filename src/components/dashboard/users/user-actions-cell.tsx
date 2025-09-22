"use client";

import { useState } from "react";
import type { Row } from "@tanstack/react-table";
import { MoreHorizontal, Loader2, AlertTriangle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { getAccountControlReasoning } from "@/app/(dashboard)/dashboard/users/actions";

interface UserActionsCellProps {
  row: Row<User>;
}

export function UserActionsCell({ row }: UserActionsCellProps) {
  const user = row.original;
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    description: "",
    action: () => {},
    actionLabel: "",
  });

  const handleActionClick = async (actionType: "activate" | "suspend") => {
    setIsLoading(true);
    setIsMenuOpen(false); // Close dropdown

    const result = await getAccountControlReasoning(actionType, user);

    setIsLoading(false);

    if (result.success) {
      setAlertContent({
        title: `Confirm ${actionType}`,
        description: result.reasoning || "Are you sure you want to proceed?",
        action: () => {
          // Here you would call the actual Firebase update
          console.log(`${actionType} user:`, user.email);
          toast({
            title: `User ${actionType}d`,
            description: `${user.fullName}'s account has been ${actionType}d.`,
          });
        },
        actionLabel: `Confirm ${actionType}`,
      });
    } else {
      setAlertContent({
        title: "Error",
        description: result.error || "An unknown error occurred.",
        action: () => {},
        actionLabel: "OK",
      });
    }

    setIsAlertOpen(true);
  };

  const handleEdit = () => {
    // In a real app, this would open an edit modal/form
    toast({
      title: "Edit User",
      description: `Editing functionality for ${user.fullName} is not implemented in this demo.`,
    });
  }

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-primary" /> {alertContent.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={alertContent.action}>
              {alertContent.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            <span className="sr-only">Open menu</span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.isVerified ? (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleActionClick("suspend")}
            >
              Suspend
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleActionClick("activate")}>
              Activate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}