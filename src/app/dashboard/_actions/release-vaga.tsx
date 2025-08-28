"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Lógica de preço: R$25 por dia. Qualquer fração de dia conta como um dia inteiro.
function calcularValor(dataEntrada: Date, dataSaida: Date): number {
    const diffMs = dataSaida.getTime() - dataEntrada.getTime();
    

    // Converte milissegundos para dias e arredonda para cima.
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); 

    const valorDiaria = 25.00;

    return diffDays * valorDiaria;
}
type LiberarVaga = {
    data_entrada: Date;
    data_saida: Date;
}[];
type CaixaQueryResult = {
  id: number;
}[];

export async function releaseVagaAction(transactionId: number) {
    // const caixa = await prisma.$queryRaw<CaixaQueryResult>`SELECT id FROM caixas WHERE data_fechamento IS NULL LIMIT 1`;
    const caixa = await prisma.caixas.findFirst({
        where: {
            data_fechamento: null
        },
        select: {
            id: true
        }
    }) 
    if (!caixa) {
            throw new Error("Nenhum caixa aberto.");
    }
        
    
    // await prisma.$queryRaw`UPDATE transacoes SET caixaId = ${caixa[0].id} WHERE id = ${transactionId}`
    await prisma.transacoes.update({
        where: {
            id: transactionId
        },
        data: {
            caixaId: caixa.id
        }
    })


    try {
        // const transacao = await prisma.$queryRaw<LiberarVaga>`SELECT data_entrada, data_saida  FROM transacoes WHERE id = ${transactionId}`;
        const transacao = await prisma.transacoes.findFirst({
            where: {
                id: transactionId
            },
            select: {
                data_entrada: true,
                data_saida: true
            }
        })
        if (!transacao) {
            throw new Error("Transação não encontrada.");
        }

        if (transacao.data_saida) {
            throw new Error("Esta vaga já foi liberada.");
        }
        
        if (!caixa.id) {
            throw new Error("A transação não está associada a nenhum caixa.");
        }

        const dataSaida = new Date();
        const valorPago = calcularValor(transacao.data_entrada, dataSaida);

        // Usamos uma transação do Prisma para garantir que ambas as atualizações ocorram com sucesso.
        
        // await prisma.$transaction([
        //     prisma.$queryRaw`UPDATE transacoes SET data_saida = ${dataSaida}, valor_pago = ${valorPago} WHERE id = ${transactionId}`,
        //     prisma.$queryRaw`UPDATE caixas SET saldo_atual = saldo_atual + ${valorPago} WHERE id = ${caixa[0].id}`,
        // ]);
        await prisma.$transaction([
            prisma.transacoes.update({
                where: {
                    id: transactionId
                },
                data: {
                    data_saida: dataSaida,
                    valor_pago: valorPago
                }
            }),
            prisma.caixas.update({
                where: {
                    id: caixa.id
                },
                data: {
                    saldo_atual: { increment: valorPago }
                }
            })
        ]);

        // Revalida os caches para que as páginas sejam atualizadas com os novos dados
        revalidatePath("/dashboard");
        revalidatePath("/caixa");

        return { success: true, message: `Vaga liberada! Valor a pagar: R$${valorPago.toFixed(2)}` };
    } catch (error) {
        return { success: false, message: error || "Erro desconhecido ao liberar a vaga." };
    }
}
