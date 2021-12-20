import { BigNumber } from '@ethersproject/bignumber';

export class ProcedureData {
  procedure: string;
  name: string;
  mediaList: string[];
  sensorList: string[];
  startTime: BigNumber;
  endTime: BigNumber;

  constructor(object) {
    this.procedure = object.procedure;
    this.name = object.name;
    this.mediaList = object.mediaList;
    this.sensorList = object.sensorList;
    this.startTime = BigNumber.from(Date.parse(object.startTime) / 1000);
    this.endTime = BigNumber.from(Date.parse(object.startTime) / 1000);
  }

  getObject() {
    return {
      procedure: this.procedure,
      name: this.name,
      mediaList: this.mediaList,
      sensorList: this.sensorList,
      startTime: this.startTime,
      endTime: this.endTime,
    };
  }
}
