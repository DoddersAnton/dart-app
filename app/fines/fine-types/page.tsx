import Link from "next/link";
import { FineTypeTable } from "./fine-type-table";
import { fineTypeColumns } from "./fine-types-columns";
import { db } from "@/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export const dynamic = "force-dynamic";
    

export default async function GetFineTypePage() {
  const fines = (await db.query.fines.findMany()).map((fine) => ({
    ...fine,
    description: fine.description ?? "No description available",
    createdAt: fine.createdAt ? fine.createdAt.toISOString() : null,
  }));


  
  return (
 
    
    <div className="px-2 w-full mx-auto lg:w-[80%] mt-12">
      <Link
        href="/fines/fine-types/add-fine-type"
        className="flex justify-center mt-22"
      >
        <Button className="mb-4" variant="outline">
          Add Fine Type
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Fines</CardTitle>
          <CardDescription>List of all fines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <FineTypeTable columns={fineTypeColumns} data={fines} />
        </CardContent>
      </Card>
    </div>
  );
}
