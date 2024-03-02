import { IsNotEmpty, IsOptional } from "class-validator";
import { ObjectId } from "mongodb";

export class UploadReportPictureRequest {
    constructor(file?: Express.Multer.File, reportId?: ObjectId) {
        this.file = file ?? {} as Express.Multer.File
        this.reportId = reportId ?? new ObjectId()
    }

    @IsNotEmpty({ message: 'Picture is required'})
    public file: Express.Multer.File

    @IsOptional()
    public reportId: ObjectId
}
