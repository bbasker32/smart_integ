import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export const columns = [
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback>
              {`${row.original.firstName?.[0] || ""}${
                row.original.lastName?.[0] || ""
              }`}
            </AvatarFallback>
          </Avatar>
          <span className="font-['Montserrat',Helvetica] text-sm text-[#444444]">
            {`${row.original.firstName || ""} ${row.original.lastName || ""}`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="font-['Montserrat',Helvetica] text-sm text-[#444444]">
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="font-['Montserrat',Helvetica] text-sm text-[#444444]">
        {row.getValue("role")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
      const status = row.getValue("status");
      const user = row.original;
      const toggleStatus = async () => {
        const newStatus = status === "active" ? "inactive" : "active";
        if (table.options.meta && table.options.meta.onStatusChange) {
          table.options.meta.onStatusChange(user, newStatus);
        }
      };
      return (
        <Badge
          className={
            status === "active"
              ? "bg-[#E8F5E9] text-[#2E7D32] font-['Montserrat',Helvetica] text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-[#2E7D32] hover:text-white"
              : "bg-[#FFEBEE] text-[#C62828] font-['Montserrat',Helvetica] text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-[#C62828] hover:text-white"
          }
          onClick={toggleStatus}
          style={{ userSelect: "none" }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ row }) => {
      const joinDate = row.getValue("joinDate");
      const formattedDate = joinDate
        ? new Date(joinDate).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "N/A";

      return (
        <span className="font-['Montserrat',Helvetica] text-sm text-[#444444]">
          {formattedDate}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row, table }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-[#E3F2FD] text-[#214389] border-none hover:bg-[#214389] hover:text-white font-['Montserrat',Helvetica] text-xs px-4 py-1 h-7"
            onClick={() =>
              table.options.meta &&
              table.options.meta.onEditUser &&
              table.options.meta.onEditUser(user)
            }
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="bg-[#FFEBEE] text-[#C62828] border-none hover:bg-[#C62828] hover:text-white font-['Montserrat',Helvetica] text-xs px-4 py-1 h-7"
            onClick={() =>
              table.options.meta &&
              table.options.meta.onDeleteUser &&
              table.options.meta.onDeleteUser(user)
            }
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      );
    },
  },
];
