"use server";

import { prisma } from "@/lib/prisma";

export interface VagaOcupada {
    id: number;
    placa_veiculo: string | null;
    modelo: string | null;
    andar: number;
    lado: 'A' | 'V';
    vaga: number;
    data_entrada: Date;
}

export async function getVagasOcupadasAction(): Promise<VagaOcupada[]> {
    // Busca todas as transações que não possuem data de fechamento, ou seja, estão ativas.
    // return await prisma.$queryRaw<VagaOcupada[]>`SELECT * FROM transacoes WHERE data_saida IS NULL ORDER BY data_saida DESC`;
    return await prisma.transacoes.findMany({where: {data_saida: null}, orderBy: {data_saida: 'desc'}});
}
