import { HostItem } from "../types/Configuration";
import { Message } from "../types/Message";

export enum MessageType {
  HOSTS = "hosts",
  ERROR = "error",
}

export interface MessageHosts extends Message {
  type: "hosts";
  data: {
    local?: { type: string }[];
    remote?: HostItem[];
  };
}

export interface MessageError extends Message {
  type: "error";
  data: string;
}
