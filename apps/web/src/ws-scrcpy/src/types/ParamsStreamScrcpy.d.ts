import VideoSettings from "../app/VideoSettings";
import { ACTION } from "../common/Action";
import { ParamsStream } from "./ParamsStream";

export interface ParamsStreamScrcpy extends ParamsStream {
  action: ACTION.STREAM_SCRCPY;
  ws: string;
  fitToScreen?: boolean;
  videoSettings?: VideoSettings;
}
