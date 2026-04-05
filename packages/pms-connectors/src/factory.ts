import { PmsConnector, type PmsConfig, type PmsConnectorType } from "./pms-interface.js";
import { MewsConnector } from "./mews-connector.js";
import { CloudbedsConnector } from "./cloudbeds-connector.js";
import { GenericWebhookConnector } from "./generic-connector.js";

const connectorMap: Record<
  PmsConnectorType,
  new (config: PmsConfig) => PmsConnector
> = {
  MEWS: MewsConnector,
  CLOUDBEDS: CloudbedsConnector,
  OPERA: GenericWebhookConnector, // TODO: implement Opera OXI connector
  HOTELOGIX: GenericWebhookConnector, // TODO: implement Hotelogix connector
  GENERIC_WEBHOOK: GenericWebhookConnector,
};

export function createConnector(config: PmsConfig): PmsConnector {
  const ConnectorClass = connectorMap[config.type];
  if (!ConnectorClass) {
    throw new Error(`Unsupported PMS type: ${config.type}`);
  }
  return new ConnectorClass(config);
}
