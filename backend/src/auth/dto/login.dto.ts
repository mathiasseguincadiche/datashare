import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail({}, { message: "Format email invalide" })
  email: string;

  @ApiProperty({ example: "MotDePasse123" })
  @IsNotEmpty({ message: "Le mot de passe est requis" })
  password: string;
}
