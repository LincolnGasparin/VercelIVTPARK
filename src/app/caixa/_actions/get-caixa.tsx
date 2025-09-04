"use server";

import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

// Este é o tipo que você deve exportar e usar no seu componente de cliente
export type Caixas = {
  id: number;
  data_abertura: Date;
  data_fechamento: Date | null;
  saldo_abertura: Decimal; // Note que é `number`
  saldo_atual: Decimal | null;
  saldo_fechamento: Decimal | null; // Note que é `number`
  operador: string;
};

export async function getCaixaAction(): Promise<Caixas[]> {
  try {
    const caixasFromDb = await prisma.caixas.findMany({
      orderBy: {
        data_abertura: 'desc',
      },
    });

    // Converte os campos Decimal para number antes de retornar
    return caixasFromDb.map((caixa:Caixas) => ({
      ...caixa,
      saldo_abertura: Number(caixa.saldo_abertura),
      saldo_atual: Number(caixa.saldo_atual) ,
      saldo_fechamento: Number(caixa.saldo_fechamento) ,
    }));

  } catch (error) {
    console.error("Erro ao buscar histórico de caixas:", error);
    return [];
  }
}
