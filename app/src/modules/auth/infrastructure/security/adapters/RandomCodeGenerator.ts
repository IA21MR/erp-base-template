// Adaptador para generar códigos de verificación aleatorios
// Implementación concreta del puerto CodeGenerator

import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { CodeGenerator } from '../../../domain/services/CodeGenerator.interface';

@Injectable()
export class RandomCodeGenerator implements CodeGenerator {
  generate(): string {
    // Genera un código de 6 dígitos criptográficamente seguro entre 100000 y 999999
    const code = randomInt(100000, 999999);
    return code.toString();
  }
}
