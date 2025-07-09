import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";

export function ValidationPopUp({
  isOpen,
  onClose,
  onConfirm,
  message,
  type = "project",
}) {
  const getDefaultMessage = () => {
    switch (type) {
      case "profile":
        return "Êtes-vous sûr de vouloir supprimer ce profil ?";
      case "project":
      default:
        return "Êtes-vous sûr de vouloir annuler le projet ?";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] p-8 flex flex-col items-center">
        <div className="text-center font-['Montserrat'] text-lg font-semibold mb-8">
          {message || getDefaultMessage()}
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            className="w-[90px] h-[40px] border-[#214389] text-[#214389] font-['Montserrat'] text-base"
            onClick={onConfirm}
          >
            Oui
          </Button>
          <Button
            className="w-[90px] h-[40px] bg-[#214389] hover:bg-[#214389]/90 text-white font-['Montserrat'] text-base"
            onClick={onClose}
          >
            Non
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
