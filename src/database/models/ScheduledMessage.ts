/* eslint-disable @stylistic/js/newline-per-chained-call */
import type { DocumentType } from "@typegoose/typegoose";
import { getModelForClass, prop } from "@typegoose/typegoose";

export class ScheduledMessageSchema {
  @prop({ type: String, required: true }) channelId!: string;
  @prop({ type: String, unique: true, default: () => Math.random().toString(36).substring(2, 8) }) id!: string;
  @prop({ type: String, required: true }) message!: string;
  @prop({ type: String }) messageId?: string;
  @prop({ type: Date, required: true }) sendAt!: Date;
}

export type ScheduledMessageDocument = DocumentType<ScheduledMessageSchema>;

export const ScheduledMessage = getModelForClass(ScheduledMessageSchema);
