import { IsArray, IsHexColor, IsNumber, IsObject, IsPositive, IsString, Length, IsUUID, IsIP } from "class-validator"

export class CreateRegionRequest {
    
    public constructor() {
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

    @IsString()
    @Length(3, 100)
    public name: string

    @IsNumber()
    @IsPositive()
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
