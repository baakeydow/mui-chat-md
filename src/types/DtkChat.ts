// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { DtkChatMessage } from "./DtkChatMessage";
import type { DtkChatUser } from "./DtkChatUser";

export interface DtkChat { channel_id: string, last_update: string, users: Array<DtkChatUser>, messages: Array<DtkChatMessage>, }