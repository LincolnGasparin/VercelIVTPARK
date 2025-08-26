"use server";

import { prisma } from "@/lib/prisma";

// Define um tipo para as transações que serão exibidas no modal
export type TransacaoDetalhe = {
  id: number;
  placa_veiculo: string;
  modelo: string | null;
  data_entrada: Date;
  data_saida: Date | null;
  valor_pago: number | null;
};

export async function getTransacoesPorCaixaAction(caixaId: number): Promise<TransacaoDetalhe[]> {
  if (!caixaId) {
    return [];
  }

  try {


    // 2. Busca as transações (saídas) dentro desse período
    // const transacoes = await prisma.$queryRaw<any>`SELECT * FROM transacoes WHERE caixaId = ${caixaId} AND data_saida IS NOT NULL ORDER BY data_saida DESC`;
    const transacoes = await prisma.transacoes.findMany({
      where: {
        caixaId: caixaId,
        data_saida: {
          not: null,
        },
      },
      orderBy: {
        data_saida: 'desc',
      },
    });
    
    // 3. Converte o valor Decimal do Prisma para number para ser serializável
    return transacoes.map((t: TransacaoDetalhe) => ({
      ...t,
      valor_pago: t.valor_pago ? Number(t.valor_pago) : null,
    }));

  } catch (error) {
    console.error("Erro ao buscar transações do caixa:", error);
    return [];
  }
}