"use server";

import {z} from "zod";
import { prisma } from "@/lib/prisma";


const createCadastroSchema = z.object({
    caixaId: z.number(),
    modelo: z.string().optional(),
    placa_veiculo: z.string().max(8, "maximo 8 caracteres").optional(),
    andar: z.number().max(22, "Andar invalido"),
    lado: z.string().max(1, "Lado invalido"),
    vaga: z.number().max(7, "Vaga invalida"),
    data_entrada: z.string().optional(), // Pode ser omitido, será preenchido no servidor
    data_saida: z.string().optional(), // Pode ser omitido, será preenchido no servidor
    valor_pago: z.number().positive().min(0, "Valor pago deve ser um número positivo").optional(), // Pode ser omitido, será preenchido no servidor
});

type CreateCadastroFormData = z.infer<typeof createCadastroSchema>;

// Definimos um tipo para o resultado da query, para maior segurança.
type VagaOcupadaResult = {
    id: number;
}[];

export async function createCadastroAction(data: CreateCadastroFormData) {
    console.log(data);
    // 1. A query agora verifica se a vaga está ocupada (data_saida IS NULL)
    const vagasOcupadas = await prisma.$queryRaw<VagaOcupadaResult>`SELECT id FROM transacoes WHERE lado = ${data.lado} AND vaga = ${data.vaga} AND andar = ${data.andar} AND data_saida IS NULL`;
    console.log(vagasOcupadas); 

    // 2. A verificação agora checa se o array retornado tem algum item.
    // Se o tamanho for maior que 0, a vaga está ocupada.
    if (vagasOcupadas.length > 0) {
        return {
            data: null,
            error: "Vaga ocupada"
        };
    }

    const schema = createCadastroSchema.safeParse(data);
    if (!schema.success) {
        return {
           data: null,
           error: schema.error.issues[0].message
        };
    }


    try {
        await prisma.$queryRaw`INSERT INTO transacoes (caixaId, modelo, placa_veiculo, andar, lado, vaga, data_entrada) VALUES (${data.caixaId}, ${data.modelo}, ${data.placa_veiculo}, ${data.andar}, ${data.lado}, ${data.vaga}, ${data.data_entrada})`;
        return {
            data: "Cadastro criado com sucesso",
            error: null
        };
        
    } catch (error) {
        return {
            data: null,
            error: "Erro ao registrar o veículo"
        };
        
    }
}
