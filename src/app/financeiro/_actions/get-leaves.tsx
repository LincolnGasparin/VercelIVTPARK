"use server";
import {prisma} from "@/lib/prisma";


export interface Leave  {
    id: number;
    modelo: string;
    placa_veiculo: string;
    data_entrada: Date;
    data_saida: Date;
    caixaId: number;
    valor_pago: number;
};

export async function getLeaveAction() : Promise<Leave[]> {
    // const result = await prisma.$queryRaw<Leave[]>`SELECT * FROM transacoes WHERE data_saida IS NOT NULL ORDER BY data_saida DESC`;
    const result = await prisma.transacoes.findMany({where: {data_saida: {not: null}}, orderBy: {data_saida: 'desc'}});
    return result;
}



