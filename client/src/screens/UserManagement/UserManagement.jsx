import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { DataTable } from "../../components/ui/data-table";
import { columns } from "./columns.jsx";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { AddUserModal } from "../../components/modals/AddUserModal";
import { userService } from "../../services/user.service";
import { ValidationPopUp } from "../../components/modals/ValidationPopUp";
import { useToast } from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";

// import { DashboardLayout } from '../../components/Layout/DashboardLayout';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [userToChangeStatus, setUserToChangeStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const { showSuccess, showError, showWarning, showInfo, dismissAll } =
    useToast();
  const navigate = useNavigate();
  const [permissionErrorShown, setPermissionErrorShown] = useState(false);

  // Remove role-based frontend protection - now handled server-side
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response);
    } catch (error) {
      if (error.response?.status === 403 && !permissionErrorShown) {
        setPermissionErrorShown(true);
        showError("You don't have permission to access this page");
        navigate("/");
      } else if (!permissionErrorShown) {
        showError("Failed to load users");
      }
    }
  };

  // Edit user handler
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Delete user handler
  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    showWarning(
      `Attention : Si vous supprimez cet utilisateur (${user.firstName} ${user.lastName}), il ne pourra plus se connecter.`,
      { sticky: true }
    );
  };

  // Confirm delete
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete.id);
      showSuccess(
        `L'utilisateur ${userToDelete.firstName} ${userToDelete.lastName} a été supprimé avec succès.`
      );
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (err) {
      showError("Erreur lors de la suppression de l'utilisateur.");
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    dismissAll();
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    dismissAll();
  };

  // Status change handler
  const handleStatusChange = (user, newStatus) => {
    setUserToChangeStatus(user);
    setNewStatus(newStatus);
    setIsStatusModalOpen(true);
    const action = newStatus === "active" ? "activer" : "désactiver";
    const consequence =
      newStatus === "active"
        ? "pourra se connecter à la plateforme"
        : "ne pourra plus se connecter à la plateforme";
    showWarning(
      `Attention : Si vous ${action} le compte de ${user.firstName} ${user.lastName}, il ${consequence}.`,
      { sticky: true }
    );
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!userToChangeStatus || !newStatus) return;
    try {
      await userService.updateUserStatus(userToChangeStatus.id, newStatus);
      setUsers((users) =>
        users.map((user) =>
          String(user.id) === String(userToChangeStatus.id)
            ? { ...user, status: newStatus }
            : user
        )
      );
      const action = newStatus === "active" ? "activé" : "désactivé";
      const consequence =
        newStatus === "active"
          ? "peut maintenant se connecter à la plateforme"
          : "ne peut plus se connecter à la plateforme";
      showSuccess(
        `Vous avez ${action} le compte de ${userToChangeStatus.firstName} ${userToChangeStatus.lastName}`
      );
      setTimeout(() => {
        showInfo(
          `${userToChangeStatus.firstName} ${userToChangeStatus.lastName} ${consequence}.`
        );
      }, 1000);
    } catch (err) {
      showError("Échec de la mise à jour du statut de l'utilisateur");
    }
    setIsStatusModalOpen(false);
    setUserToChangeStatus(null);
    setNewStatus("");
    dismissAll();
  };

  // Cancel status change
  const handleCancelStatusChange = () => {
    setIsStatusModalOpen(false);
    setUserToChangeStatus(null);
    setNewStatus("");
    dismissAll();
  };

  // Success after edit
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    loadUsers();
    showSuccess("Utilisateur modifié avec succès.");
  };

  // Success after add
  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    loadUsers();
    showSuccess("Nouvel utilisateur ajouté avec succès.");
  };

  return (
    <>
      <div className="py-4 md:py-6 px-4 md:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 mb-6">
          <h1 className="font-['Montserrat'] font-medium text-lg md:text-xl">
            User Management
          </h1>
          <div className="font-['Montserrat'] text-sm">
            Home &gt; User Management
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 px-4 md:px-8 pb-8">
        {/* User List Section */}
        <div className="bg-white rounded-[5px] border border-[#eae7e7] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-['Montserrat',Helvetica] text-[#444444]">
              User List
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#555555]" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[248px] h-[42px] border-[#C7C5C5] font-['Montserrat',Helvetica] text-sm"
                />
              </div>
              <Button
                className="bg-[#214389] text-white font-['Montserrat',Helvetica] text-sm hover:bg-[#214389]/90 h-[42px]"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add New User
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={users}
            searchKey="fullName"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showSearchInTable={false}
            meta={{
              onStatusChange: handleStatusChange,
              onEditUser: handleEditUser,
              onDeleteUser: handleDeleteUser,
            }}
          />
        </div>
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        editMode={false}
      />
      <AddUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        editMode={true}
        onSuccess={handleEditSuccess}
      />
      <ValidationPopUp
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={confirmDeleteUser}
        message={"Êtes-vous sûr de vouloir supprimer cet utilisateur ?"}
      />
      <ValidationPopUp
        isOpen={isStatusModalOpen}
        onClose={handleCancelStatusChange}
        onConfirm={confirmStatusChange}
        message={`Êtes-vous sûr de vouloir ${
          newStatus === "active" ? "activer" : "désactiver"
        } le compte de ${userToChangeStatus?.firstName} ${
          userToChangeStatus?.lastName
        } ?`}
      />
    </>
  );
};
