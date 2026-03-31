import type { Client } from "discord.js";
import type { Timeout } from "safe-timers";
import { setTimeoutAt } from "safe-timers";
import type { ScheduledMessageDocument } from "../../database/models/ScheduledMessage";
import { ScheduledMessage } from "../../database/models/ScheduledMessage";

export default function scheduleHandler(client: Client<true>): void {
  void ScheduledMessage.find({ messageId: { $exists: false } }).then(messages => messages.forEach(message => {
    setupScheduledMessage(client, message);
  }));
}

export const jobs = new Map<string, Timeout>();

export function setupScheduledMessage(client: Client<true>, message: ScheduledMessageDocument): void {
  const existing = jobs.get(message.id);
  if (existing) existing.clear();

  const timeout = setTimeoutAt(() => void (async () => {
    try {
      const channel = await client.channels.fetch(message.channelId);
      if (!channel?.isTextBased() || !channel.isSendable()) return console.warn(`Could not find text channel with ID ${message.channelId} for scheduled message with ID ${message.id}.`);
      const sentMessage = await channel.send(message.message);
      await ScheduledMessage.findByIdAndUpdate(message._id, { messageId: sentMessage.id }).exec();
    } catch (error) {
      console.error(`Failed to send scheduled message with ID ${message.id}:`, error);
    } finally {
      jobs.delete(message.id);
    }
  })(), message.sendAt.getTime());

  jobs.set(message.id, timeout);
}
