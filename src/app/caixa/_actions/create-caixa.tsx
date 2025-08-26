"use server";

import {z} from "zod";
import { da } from "zod/locales";
import { prisma } from "@/lib/prisma";



const createCaixaSchema = z.object({
    saldo_abertura: z.number().min(0, "Saldo de abertura deve ser um número positivo"),
    operador: z.string().min(1, "Operador é obrigatório"),
    data_abertura: z.string().optional(), // Pode ser omitido, será preenchido no servidor
    data_fechamento: z.string().optional(), // Pode ser omitido, será preenchido no servidor
    saldo_fechamento: z.number().optional() // Pode ser omitido, será preenchido no servidor
});

type CreateCaixaFormData = z.infer<typeof createCaixaSchema>;

export async function createCaixaAction(data: CreateCaixaFormData) {
    console.log(data);

    const schema = createCaixaSchema.safeParse(data);
    if (!schema.success) {
        return {
           data: null,
           error: schema.error.issues[0].message
        };
    }


    try {
        
        // await prisma.$queryRaw`INSERT INTO caixas (saldo_abertura, operador, data_abertura) VALUES (${data.saldo_abertura}, ${data.operador}, NOW())`;
        await prisma.caixas.create({
            data: {
                saldo_abertura: data.saldo_abertura,
                operador: data.operador,
                data_abertura: new Date(),
        },
        });
        
        return {
            data: "Caixa criado com sucesso",
            error: null
        };
        
    } catch (error) {
        return {
            data: null,
            error: "Erro ao criar caixa"
        };
        
    }
}
