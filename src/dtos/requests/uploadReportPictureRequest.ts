import { IsNotEmpty, IsMongoId } from "class-validator";

export class UploadReportPictureRequest {
    constructor(file?: Express.Multer.File, reportId?: string) {
        this.file = file ?? {} as Express.Multer.File
        this.reportId = reportId ?? ""
        this.deviceUUID = ""
    }

    @IsNotEmpty({ message: 'Picture is required'})
    public file: Express.Multer.File

    @IsMongoId()
    public reportId : string

    public deviceUUID: string
}
