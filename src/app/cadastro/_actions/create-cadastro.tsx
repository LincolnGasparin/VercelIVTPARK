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

export async function createCadastroAction(data: CreateCadastroFormData) {
    console.log(data);
    // 1. A query agora verifica se a vaga está ocupada (data_saida IS NULL)
    // const vagasOcupadas = await prisma.transacoes.findFirst({where: {lado: data.lado, vaga: data.vaga, andar: data.andar, data_saida: null}});
    // console.log(vagasOcupadas); 

    // // 2. A verificação agora checa se um registro foi encontrado.
    // // Se vagasOcupadas não for nulo, a vaga está ocupada.
    // if (vagasOcupadas) {
    //     return {
    //         data: null,
    //         error: "Vaga ocupada"
    //     };
    // }

    const schema = createCadastroSchema.safeParse(data);
    if (!schema.success) {
        return {
           data: null,
           error: schema.error.issues[0].message
        };
    }


    try {
        await prisma.transacoes.create({
            data: {
                caixaId: data.caixaId,
                modelo: data.modelo,
                placa_veiculo: data.placa_veiculo,
                andar: data.andar,
                lado: data.lado,
                vaga: data.vaga,
                data_entrada: new Date(),
            },
        },
    )
        return {
            data: "Cadastro criado com sucesso",
            error: null
        };
        
    } catch (error) {
        console.log(error);
        return {
            data: null,
            error: "Erro ao registrar o veículo",
        };
        
    }
}
