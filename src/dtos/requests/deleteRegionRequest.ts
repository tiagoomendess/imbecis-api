import { IsIP, IsMongoId, IsUUID } from "class-validator"

export class DeleteRegionRequest {
    constructor(id?: string, ipAddress?: string, deviceUUID?: string) {
        this.id = id ?? ""
        this.ipAddress = ipAddress ?? ""
        this.deviceUUID = deviceUUID ?? ""
    }

    @IsMongoId()
    public id: string

    @IsUUID(4)
    public deviceUUID: string

    @IsIP()
    public ipAddress: string
}
