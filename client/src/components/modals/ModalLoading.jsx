import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function ModalLoading({ open, progress, title = "Chargement en cours..." }) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[360px] p-6 flex flex-col items-center [&>button[data-state=open]]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center font-['Montserrat'] text-xl font-semibold mb-2">
            {title}
          </DialogTitle>
        </DialogHeader>
        <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        {progress !== undefined && (
          <div className="text-sm text-gray-500">{progress}%</div>
        )}
      </DialogContent>
    </Dialog>
  );
} 