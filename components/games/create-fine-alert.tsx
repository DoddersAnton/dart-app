import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type PopupProps = {
  showFineDialog?: boolean;
  setShowFineDialog: (value: boolean) => void;
  submitFine?: () => void;
  player?: string | null;
  fine?: string | null;
  reason?: string | null;
};

export default function CreateFineAlert({
  PopupProps,
}: {
  PopupProps: PopupProps;
}) {
  return (
    <Dialog
      open={PopupProps.showFineDialog}
      onOpenChange={PopupProps.setShowFineDialog}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fine {PopupProps.player ? PopupProps.player : "this player"}?</DialogTitle>
        </DialogHeader>
        <div>
          {PopupProps.reason}
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button onClick={PopupProps.submitFine}>Yes, Fine</Button>
          <Button variant="secondary" onClick={() => PopupProps.setShowFineDialog(false)}>
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
