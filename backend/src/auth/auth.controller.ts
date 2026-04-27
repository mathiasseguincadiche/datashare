import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("Authentification")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Creer un compte utilisateur" })
  @ApiResponse({ status: 201, description: "Compte cree avec succes" })
  @ApiResponse({ status: 400, description: "Donnees invalides" })
  @ApiResponse({ status: 409, description: "Email deja utilise" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Se connecter et recuperer un token JWT" })
  @ApiResponse({ status: 200, description: "Connexion reussie" })
  @ApiResponse({ status: 401, description: "Identifiants invalides" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
