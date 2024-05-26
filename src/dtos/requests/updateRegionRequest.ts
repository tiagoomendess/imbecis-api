import { IsHexColor, IsNumber, IsObject, IsPositive, IsString, Length, IsArray, IsMongoId, IsUUID, IsIP } from "class-validator"
import { Type } from "class-transformer";
import "reflect-metadata";

export class UpdateRegionRequest {

    public constructor() {
        this.id = ''
        this.name = ''
        this.priority = 0
        this.color = ''
        this.polygon = {
            type: "Polygon",
            coordinates: []
        }
        this.recipients = []
        this.deviceUUID = ''
        this.ipAddress = ''
    }

    @IsMongoId()
    public id: string

    @IsString()
    @Length(3, 100)
    public name: string

    
    @IsPositive()
    @Type(() => Number)
    public priority: number

    @IsHexColor()
    public color: string

    @IsObject()
    public polygon: {
        type: "Polygon";
        coordinates: number[][][]
    }

    @IsArray()
    public recipients: {
        type: "email" | "reddit" | "none"
        target: string
    }[]

    @IsUUID(4)
    public deviceUUID: string

    @IsIP()
    public ipAddress: string
}
