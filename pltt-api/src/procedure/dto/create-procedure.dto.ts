import { BigNumber } from 'ethers';

export class CreateProcedureDto {
  shid: number;
  procedureID: number;
  procedureName: string;
  startTime: string;
  endTime: string;
  mediaList: string[];
  sensorDataURLs: string[];
}

export class ProcedureMetadata {
  name: string;
  mediaList: string[];
  sensorList: string[];
  startTime: BigNumber;
  endTime: BigNumber;
}
