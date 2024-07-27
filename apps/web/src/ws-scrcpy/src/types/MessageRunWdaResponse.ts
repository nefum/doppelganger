import { WdaStatus } from "../common/WdaStatus";
import { Message } from "./Message";

export interface MessageRunWdaResponse extends Message {
  type: "run-wda";
  data: {
    udid: string;
    status: WdaStatus;
    code?: number;
    text?: string;
  };
}
