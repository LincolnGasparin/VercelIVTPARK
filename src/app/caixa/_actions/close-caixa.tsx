"use server";

import { prisma } from "@/lib/prisma";

type SomaCaixa = {
    saldo_fechamento: number,
}[];


export async function closeCaixaAction(caixaId: number) {

    const somado = await prisma.$queryRaw<SomaCaixa>`SELECT SUM(valor_pago) as saldo_fechamento FROM transacoes WHERE caixaId = ${caixaId} AND data_saida IS NOT NULL`;
    console.log(somado[0].saldo_fechamento);
    const saldo_fechamento = Number(somado[0].saldo_fechamento);
    const caixa = await prisma.$queryRaw`UPDATE caixas SET data_fechamento = NOW(), saldo_fechamento = ${saldo_fechamento}   WHERE id = ${caixaId}`;
    return {
        data: "Caixa fechado com sucesso",
        error: null 
    
    }
};