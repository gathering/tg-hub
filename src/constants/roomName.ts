import type { VoiceState } from "discord.js";

export default function roomName(voiceState: VoiceState): string {
  const id = voiceState.member?.id ?? Math.floor(Math.random() * 1000);
  return `Room ${Number(id) % 999 + 1}`;
}
