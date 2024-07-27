import { ACTION } from "../common/Action";
import { ParamsBase } from "./ParamsBase";

export interface ParamsWdaProxy extends ParamsBase {
  action: ACTION.PROXY_WDA;
  udid: string;
}
