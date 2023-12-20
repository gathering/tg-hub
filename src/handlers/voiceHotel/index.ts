import type { Client } from "discord.js";
import config from "../../config";
import cleanHotel from "./cleanHotel";
import createNewRoom from "./newRoom";

export default function voiceHotelHandler(client: Client<true>): void {
  client.on("voiceStateUpdate", async (_, newState) => {
    await cleanHotel(client);
    if (newState.channelId === config.channels.hubVoiceId) {
      const newRoom = await createNewRoom(newState);
      void newState.setChannel(newRoom);
    }
  });
  void cleanHotel(client);
}
