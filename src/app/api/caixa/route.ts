import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 1. Usar a instância compartilhada do Prisma

/**
 * Retorna o último caixa aberto (sem data de fechamento).
 * O frontend usa essa rota para verificar o status do caixa.
 */

// Função para lidar com requisições GET (Read)
export async function GET(request: Request) {
  try {
    // Correção: Usar findFirst para buscar por um campo não-único.
    // Ordenamos por data_abertura para pegar o mais recente.
    const caixaAberto = await prisma.$queryRaw`SELECT * FROM caixas WHERE data_fechamento IS NULL ORDER BY data_abertura DESC LIMIT 1`;
  
    return NextResponse.json(caixaAberto);
  } catch (error) {
    console.error("Erro ao buscar caixas:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro no servidor ao buscar os caixas." },
      { status: 500 }
    );
  }
}

// Função para lidar com requisições POST (Create)
export async function POST(request: Request) {
  try {
    // 3. Pegar os dados do corpo da requisição
    const body = await request.json();
    const { saldo_abertura, operador } = body;

    // Validação simples dos dados recebidos
    if (typeof saldo_abertura !== 'number' || !operador) {
        return NextResponse.json(
            { error: "Dados inválidos. 'saldo_abertura' (número) e 'operador' (string) são obrigatórios." },
            { status: 400 }
        );
    }

    // 4. Criar um novo caixa com os dados recebidos
    const novoCaixa = await prisma.$queryRaw`INSERT INTO caixa (saldo_abertura, operador, data_abertura) VALUES (${saldo_abertura}, ${operador}, NOW()) RETURNING *`;

    return NextResponse.json(novoCaixa, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar caixa:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro no servidor ao criar o caixa." },
      { status: 500 }
    );
  }
}