import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { DataTable } from "../../components/ui/data-table";
import { columns } from "./columns";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  joinDate: string;
  avatar: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback>
              {row.original.fullName.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="font-['Montserrat',Helvetica] text-sm text-[#444444]">{row.getValue("fullName")}</span>
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
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={
            status === "active"
              ? "bg-[#E8F5E9] text-[#2E7D32] font-['Montserrat',Helvetica] text-xs px-3 py-1 rounded-full"
              : "bg-[#FFEBEE] text-[#C62828] font-['Montserrat',Helvetica] text-xs px-3 py-1 rounded-full"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ row }) => (
      <span className="font-['Montserrat',Helvetica] text-sm text-[#444444]">
        {row.getValue("joinDate")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-[#E3F2FD] text-[#214389] border-none hover:bg-[#214389] hover:text-white font-['Montserrat',Helvetica] text-xs px-4 py-1 h-7"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            className="bg-[#FFEBEE] text-[#C62828] border-none hover:bg-[#C62828] hover:text-white font-['Montserrat',Helvetica] text-xs px-4 py-1 h-7"
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];