"use server";

import { prisma } from "@/lib/prisma";

type SomaCaixa = {
    saldo_fechamento: number,
}[];


export async function closeCaixaAction(caixaId: number) {

    // const somado = await prisma.$queryRaw<SomaCaixa>`SELECT SUM(valor_pago) as saldo_fechamento FROM transacoes WHERE caixaId = ${caixaId} AND data_saida IS NOT NULL`;
    const somado = await prisma.transacoes.aggregate({
        _sum: {
            valor_pago: true,
        },
        where: {
            caixaId: caixaId,
            data_saida: {
                not: null
            }
        },
    })
    const saldo_fechamento = somado._sum.valor_pago ?? 0;
    // const caixa = await prisma.$queryRaw`UPDATE caixas SET data_fechamento = NOW(), saldo_fechamento = ${saldo_fechamento}   WHERE id = ${caixaId}`;
    const caixa = await prisma.caixas.update({
        where: {
            id: caixaId
        },
        data: {
            data_fechamento: new Date(),
            saldo_fechamento: saldo_fechamento
        }
    })
    return {
        data: "Caixa fechado com sucesso",
        error: null 
    
    }
};