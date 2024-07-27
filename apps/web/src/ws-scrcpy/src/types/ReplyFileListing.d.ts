import { FileStats } from "./FileStats";
import { Message } from "./Message";

export interface ReplyFileListing extends Message {
  success: boolean;
  error?: string;
  list?: FileStats[];
}
