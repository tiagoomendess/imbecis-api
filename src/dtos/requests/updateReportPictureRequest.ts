import { IsNotEmpty, IsMongoId, IsIP, IsUUID } from "class-validator";

export class UpdateReportPictureRequest {
    constructor(file?: Express.Multer.File, reportId?: string, ipAddress?: string, deviceUUID?: string) {
        this.file = file ?? {} as Express.Multer.File
        this.reportId = reportId ?? ""
        this.ipAddress = ipAddress ?? ""
        this.deviceUUID = deviceUUID ?? ""
    }

    @IsNotEmpty({ message: 'Picture is required'})
    public file: Express.Multer.File

    @IsMongoId()
    public reportId : string

    @IsUUID(4)
    public deviceUUID: string

    @IsIP()
    public ipAddress: string
}
