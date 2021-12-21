import { BigNumber } from '@ethersproject/bignumber';

export class ProcedureData {
  procedure: string;
  name: string;
  mediaList: string[];
  sensorDataURLs: string[];
  startTime: BigNumber;
  endTime: BigNumber;

  constructor(object) {
    this.procedure = object.procedure;
    this.name = object.procedureName;
    this.mediaList = object.mediaList;
    this.sensorDataURLs = object.sensorDataURLs;
    this.startTime = BigNumber.from(Date.parse(object.startTime) / 1000);
    this.endTime = BigNumber.from(Date.parse(object.startTime) / 1000);
  }

  getObject() {
    return {
      procedure: this.procedure,
      name: this.name,
      mediaList: this.mediaList,
      sensorDataURLs: this.sensorDataURLs,
      startTime: this.startTime,
      endTime: this.endTime,
    };
  }
}
