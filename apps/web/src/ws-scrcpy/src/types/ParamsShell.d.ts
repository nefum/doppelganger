import { ACTION } from "../common/Action";
import { ParamsBase } from "./ParamsBase";

export interface ParamsShell extends ParamsBase {
  action: ACTION.SHELL;
  udid: string;
}
