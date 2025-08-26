"use server";
import { prisma } from "@/lib/prisma";

// Define um tipo para o resultado que a Action vai retornar para o cliente.
type CaixaStatusResult = {
  status: "aberto" | "fechado";
  id: number | null;
};

export async function statusCaixaAction(): Promise<CaixaStatusResult> {
  // A query retorna um array. Se o caixa estiver aberto, o array terá um item.
  // const caixaAberto = await prisma.$queryRaw<CaixaQueryResult>`SELECT id FROM caixas WHERE data_fechamento IS NULL ORDER BY data_abertura DESC LIMIT 1`;

  const caixaAberto = await prisma.caixas.findFirst({
    where: {
      data_fechamento: null,
    },
    orderBy: {
      data_abertura: "desc",
    },
    select: {
      id: true,
    },
  })

  if (caixaAberto) {
    // Encontrou um caixa aberto
    return { status: "aberto", id: caixaAberto.id };
  }

  // Nenhum caixa aberto encontrado
  return { status: "fechado", id: null };
}
