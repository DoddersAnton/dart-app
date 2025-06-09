"use client";
import React, { useState } from "react";
import { PayFinesDataTable } from "./pay-fines-datatable";
import { payFinesColumns } from "./play-fines-columns";


// This component allows players to pay their fines by selecting them from a list.
// It displays a table of fines with checkboxes, allowing players to select multiple fines to pay.



 export type PlayerFine = {
    id: number;
    fine: string;
    matchDate: string | null;
    status: string | null;
    notes: string | null;
    amount: number;
    createdAt: string | null;
    handleToggle: (id: number) => void;
};

type PayFinesFormProps = {
    playerFinesData: PlayerFine[];
    onSubmit?: (selectedFineIds: number[]) => void;
};

const PayFinesForm: React.FC<PayFinesFormProps> = ({
    playerFinesData,
    onSubmit,
}) => {
    const [selectedFines, setSelectedFines] = useState<number[]>([]);

    /*
    const handleToggle = (id: number) => {
        setSelectedFines((prev) =>
            prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
        );
    };
    */

    const total = playerFinesData
        .filter((fine) => selectedFines.includes(fine.id))
        .reduce((sum, fine) => sum + fine.amount, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(selectedFines);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PayFinesDataTable columns={payFinesColumns} total={total}
                                data={playerFinesData}
                                  onSelectedIdsChange={setSelectedFines} 
                                />
        </form>
    );
};

export default PayFinesForm;