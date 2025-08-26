"use server";

import { prisma } from "@/lib/prisma";

export interface Caixas {
    id: number;
    data_abertura: Date;
    data_fechamento: Date | null;
    saldo_abertura: number;
    saldo_fechamento: number;
    operador: string;
  };

export async function getCaixaAction(): Promise<Caixas[]> {
    const caixasFromDb = await prisma.$queryRaw<any[]>`SELECT * FROM caixas WHERE data_fechamento IS NOT NULL ORDER BY data_abertura DESC`;
    
    // Converte os campos Decimal para number antes de retornar para o cliente.
    return caixasFromDb.map(caixa => ({
        ...caixa,
        saldo_abertura: Number(caixa.saldo_abertura),
        // Garante que o saldo_fechamento seja 0 se for nulo
        saldo_fechamento: caixa.saldo_fechamento ? Number(caixa.saldo_fechamento) : 0,
    }));
}