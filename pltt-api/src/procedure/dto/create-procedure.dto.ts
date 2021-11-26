export class CreateProcedureDto {
    shid: number;
    procedureID: number;
    procedureName: string;
    startTime: string;
    endTime: string;
    mediaList: string[];
    sensorDataURLs: string[];
}
