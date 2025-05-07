import PlayerForm from "@/components/players/add-player";
import { Suspense } from "react";

export default function AddPlayer() {
  return (
    <div>
      <Suspense>
        <PlayerForm />
      </Suspense>
    </div>
  );
}
