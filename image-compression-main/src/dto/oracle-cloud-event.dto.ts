export interface OracleCloudEventDto {
  cloudEventsVersion: string;
  eventID: string;
  eventType: string;
  source: string;
  eventTypeVersion: string;
  eventTime: string;
  contentType: string;
  extensions: {
    compartmentId: string;
  };
  data: {
    compartmentId: string;
    compartmentName: string;
    resourceName: string;
    resourceId: string;
    availabilityDomain: string;
    additionalDetails: {
      eTag: string;
      namespace: string;
      bucketName: string;
      bucketId: string;
      archivalState: string;
    };
  };
}
