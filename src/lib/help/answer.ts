import { guideReply } from "@/lib/help/faq";

export async function answerHelp(question: string): Promise<{ reply: string; source: "guide" }> {
  return { reply: guideReply(question).reply, source: "guide" };
}
