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
    const result = await prisma.transacoes.findMany({
        where: { data_saida: { not: null } },
        orderBy: { data_saida: 'desc' },
        select: {
            id: true,
            modelo: true,
            placa_veiculo: true,
            data_entrada: true,
            data_saida: true,
            caixaId: true,
            valor_pago: true,
        },
    });
    return result.map((r) => ({
        id: r.id,
        modelo: r.modelo ?? '',
        placa_veiculo: r.placa_veiculo ?? '',
        data_entrada: r.data_entrada,
        data_saida: r.data_saida!,
        caixaId: r.caixaId,
        valor_pago: r.valor_pago ? Number(r.valor_pago) : 0,
    }));
}



