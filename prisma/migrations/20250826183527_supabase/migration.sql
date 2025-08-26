-- CreateTable
CREATE TABLE "public"."Caixas" (
    "id" SERIAL NOT NULL,
    "data_abertura" TIMESTAMP(0) NOT NULL,
    "data_fechamento" TIMESTAMP(0),
    "saldo_abertura" DECIMAL(10,2) NOT NULL,
    "saldo_atual" DECIMAL(10,2),
    "saldo_fechamento" DECIMAL(10,2),
    "operador" VARCHAR(100) NOT NULL,

    CONSTRAINT "Caixas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transacoes" (
    "id" SERIAL NOT NULL,
    "caixaId" INTEGER NOT NULL,
    "modelo" VARCHAR(100),
    "placa_veiculo" VARCHAR(20),
    "lado" VARCHAR(10) NOT NULL,
    "andar" INTEGER NOT NULL,
    "vaga" INTEGER NOT NULL,
    "data_entrada" TIMESTAMP(0) NOT NULL,
    "data_saida" TIMESTAMP(0),
    "valor_pago" DECIMAL(10,2),

    CONSTRAINT "Transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_transacoes_caixaId" ON "public"."Transacoes"("caixaId");

-- AddForeignKey
ALTER TABLE "public"."Transacoes" ADD CONSTRAINT "fk_transacao_caixa" FOREIGN KEY ("caixaId") REFERENCES "public"."Caixas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
