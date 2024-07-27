// This file is used instead of 'appium-xcuitest-driver/lib/server'

import { XCUITestDriver } from "appium-xcuitest-driver";
import * as http from "http";

declare class Server extends http.Server {
  driver: XCUITestDriver;
}

export { Server, XCUITestDriver };
