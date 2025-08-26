"use server";
import { prisma } from "@/lib/prisma";

// Define um tipo para o resultado que a Action vai retornar para o cliente.
type CaixaStatusResult = {
  status: "aberto" | "fechado";
  id: number | null;
};

// Define um tipo para o que o Prisma vai retornar da query.
type CaixaQueryResult = {
  id: number;
}[];

export async function statusCaixaAction(): Promise<CaixaStatusResult> {
  // A query retorna um array. Se o caixa estiver aberto, o array terá um item.
  const caixaAberto = await prisma.$queryRaw<CaixaQueryResult>`SELECT id FROM caixas WHERE data_fechamento IS NULL ORDER BY data_abertura DESC LIMIT 1`;

  if (caixaAberto.length > 0) {
    // Encontrou um caixa aberto
    console.log("Caixa aberto encontrado:", caixaAberto[0].id);
    return { status: "aberto", id: caixaAberto[0].id };
  }

  // Nenhum caixa aberto encontrado
  return { status: "fechado", id: null };
}
