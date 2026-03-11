import { redirect } from "next/navigation";

export default async function LegacyPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/player/${id}`);
}
