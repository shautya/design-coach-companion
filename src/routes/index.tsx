import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "@/components/editor/Editor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Q4 Brand Deck — Canva" },
      { name: "description", content: "Canva editor prototype with Design Coach feature." },
    ],
  }),
  component: Editor,
});
