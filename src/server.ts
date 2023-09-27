import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import cors from "cors";
import compression from "compression";
import express from "express";
import container from "./config/di";

export default class Server {
  private readonly server: InversifyExpressServer;

  constructor() {
    this.server = new InversifyExpressServer(container, null, {
      rootPath: "/duplo-service",
    });

    this.server.setConfig((app01) => {
      app01.use(cors());
      app01.use(compression());
      app01.use(express.json({ limit: "50mb" }));
      app01.use(
        express.urlencoded({
          extended: true,
          limit: "50mb",
        })
      );
      app01.disable("x-powered-by");
    });
  }

  getServer(): InversifyExpressServer {
    return this.server;
  }
}
