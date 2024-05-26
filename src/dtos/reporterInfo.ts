import { IsEmail, IsIn, IsString, Length, IsOptional } from "class-validator"

export class ReporterInfo {
    constructor() {
        this.name = ''
        this.email = ''
        this.idNumber = ''
        this.idType = ''
        this.obs = ''
    }

    @IsString()
    @Length(3, 100)
    public name: string
    
    @IsEmail()
    public email: string

    @IsString()
    @Length(3, 25)
    public idNumber : string

    @IsString()
    @Length(1, 25)
    @IsIn(['cc', 'residency', 'passport'])
    public idType : string

    @IsOptional()
    @IsString()
    @Length(1, 255)
    public obs : string | undefined
}
