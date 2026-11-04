"use client";
import { useParams } from "next/navigation";
import YachtsPage from "@/components/yachts-manager";
export default function EditYachtPage() {
  const { id } = useParams<{ id: string }>();
  return <YachtsPage editHull={id} />;
}
