"use client";

import React from 'react';

// Tipos para os diferentes tipos de ticket
interface TicketEntradaData {
  placa: string;
  modelo: string;
  andar: number;
  lado: string;
  vaga: number;
  dataEntrada: string;
  ticketId: string;
}

interface TicketSaidaData {
  placa: string;
  modelo: string;
  andar: number;
  lado: string;
  vaga: number;
  dataEntrada: string;
  dataSaida: string;
  valorPago: number;
  diasEstacionado: number;
  ticketId: string;
}

export interface RelatorioCaixaData {
  caixaId: number;
  operador: string;
  dataAbertura: string;
  dataFechamento: string;
  saldoAbertura: number;
  saldoFechamento: number;
  totalReceita: number;
  quantidadeCarros: number;
  transacoes: Array<{
    placa: string;
    modelo: string;
    dataEntrada: string;
    dataSaida: string;
    valorPago: number;
  }>;
}

interface TicketPrinterProps {
  type: 'entrada' | 'saida' | 'relatorio-caixa';
  data: TicketEntradaData | TicketSaidaData | RelatorioCaixaData | null;
  onPrintComplete: () => void;
}

// Função auxiliar para calcular dias estacionado (movida para escopo global)
const calcularDias = (entrada: string, saida: string): number => {
  const entradaDate = new Date(entrada);
  const saidaDate = new Date(saida);
  const diffMs = saidaDate.getTime() - entradaDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 1 : diffDays;
};

// Função auxiliar para formatar moeda brasileira (movida para escopo global)
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Função auxiliar para formatar data brasileira (movida para escopo global)
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString("pt-BR");
};

export function TicketPrinter({ type, data, onPrintComplete }: TicketPrinterProps) {
  
  // Gera ID único para tickets
  const generateTicketId = (): string => {
    const now = new Date();
    const timestamp = now.getTime().toString();
    return `TK${timestamp.slice(-8)}`;
  };

  // Imprime ticket de entrada
  const printTicketEntrada = async () => {
    if (!data || type !== 'entrada') return;
    
    const ticketData = data as TicketEntradaData;
    const ticketContent = `
╔══════════════════════════════════════════════════════════════╗
║                    ESTACIONAMENTO IVT PARK                  ║
╠══════════════════════════════════════════════════════════════╣
║                        ENTRADA                              ║
║                                                            ║
║  TICKET ID: ${ticketData.ticketId.padEnd(40)} ║
║  DATA: ${new Date(ticketData.dataEntrada).toLocaleDateString('pt-BR').padEnd(45)} ║
║  HORA: ${new Date(ticketData.dataEntrada).toLocaleTimeString('pt-BR').padEnd(45)} ║
║                                                            ║
║  PLACA: ${ticketData.placa.padEnd(45)} ║
║  MODELO: ${ticketData.modelo.padEnd(43)} ║
║                                                            ║
║  LOCALIZAÇÃO:                                            ║
║    ANDAR: ${ticketData.andar.toString().padEnd(45)} ║
║    LADO: ${ticketData.lado === 'A' ? 'AMARELO' : 'VERDE'.padEnd(43)} ║
║    VAGA: ${ticketData.vaga.toString().padEnd(45)} ║
║                                                            ║
║  CÓDIGO DA VAGA: ${(ticketData.lado + ticketData.andar.toString().padStart(2, '0') + ticketData.vaga.toString().padStart(2, '0')).padEnd(35)} ║
║                                                            ║
║  ⚠️  GUARDE ESTE TICKET!                                ║
║     NECESSÁRIO PARA SAÍDA                                ║
║                                                            ║
║  TARIFA: R$ 25,00 por dia                                ║
║     (fração de dia = dia inteiro)                        ║
║                                                            ║
╚══════════════════════════════════════════════════════════════╝
    `;

    await printContent(ticketContent, 'Ticket de Entrada');
  };

  // Imprime ticket de saída
  const printTicketSaida = async () => {
    if (!data || type !== 'saida') return;
    
    const ticketData = data as TicketSaidaData;
    const ticketContent = `
╔══════════════════════════════════════════════════════════════╗
║                    ESTACIONAMENTO IVT PARK                  ║
╠══════════════════════════════════════════════════════════════╣
║                         SAÍDA                               ║
║                                                            ║
║  TICKET ID: ${ticketData.ticketId.padEnd(40)} ║
║  DATA ENTRADA: ${new Date(ticketData.dataEntrada).toLocaleDateString('pt-BR').padEnd(35)} ║
║  HORA ENTRADA: ${new Date(ticketData.dataEntrada).toLocaleTimeString('pt-BR').padEnd(35)} ║
║  DATA SAÍDA: ${new Date(ticketData.dataSaida).toLocaleDateString('pt-BR').padEnd(37)} ║
║  HORA SAÍDA: ${new Date(ticketData.dataSaida).toLocaleTimeString('pt-BR').padEnd(37)} ║
║                                                            ║
║  PLACA: ${ticketData.placa.padEnd(45)} ║
║  MODELO: ${ticketData.modelo.padEnd(43)} ║
║                                                            ║
║  LOCALIZAÇÃO:                                            ║
║    ANDAR: ${ticketData.andar.toString().padEnd(45)} ║
║    LADO: ${ticketData.lado === 'A' ? 'AMARELO' : 'VERDE'.padEnd(43)} ║
║    VAGA: ${ticketData.vaga.toString().padEnd(45)} ║
║                                                            ║
║  TEMPO ESTACIONADO: ${ticketData.diasEstacionado} dia(s)${' '.repeat(35)} ║
║                                                            ║
║  VALOR PAGO: ${formatCurrency(ticketData.valorPago).padEnd(40)} ║
║                                                            ║
║  OBRIGADO PELA PREFERÊNCIA!                              ║
║                                                            ║
╚══════════════════════════════════════════════════════════════╝
    `;

    await printContent(ticketContent, 'Ticket de Saída');
  };

  // Imprime relatório de caixa
  const printRelatorioCaixa = async () => {
    if (!data || type !== 'relatorio-caixa') return;
    
    const relatorioData = data as RelatorioCaixaData;
    const ticketContent = `
╔══════════════════════════════════════════════════════════════╗
║                    ESTACIONAMENTO IVT PARK                  ║
╠══════════════════════════════════════════════════════════════╣
║                    RELATÓRIO DE CAIXA                      ║
║                                                            ║
║  CAIXA ID: ${relatorioData.caixaId.toString().padEnd(40)} ║
║  OPERADOR: ${relatorioData.operador.padEnd(42)} ║
║                                                            ║
║  ABERTURA: ${formatDate(relatorioData.dataAbertura).padEnd(42)} ║
║  FECHAMENTO: ${formatDate(relatorioData.dataFechamento).padEnd(40)} ║
║                                                            ║
║  SALDO INICIAL: ${formatCurrency(relatorioData.saldoAbertura).padEnd(35)} ║
║  TOTAL RECEITA: ${formatCurrency(relatorioData.totalReceita).padEnd(35)} ║
║  SALDO FINAL: ${formatCurrency(relatorioData.saldoFechamento).padEnd(37)} ║
║                                                            ║
║  QUANTIDADE DE CARROS: ${relatorioData.quantidadeCarros.toString().padEnd(30)} ║
║                                                            ║
║  ═══════════════════════════════════════════════════════════║
║                                                            ║
║  RESUMO:                                                   ║
║    • ${relatorioData.quantidadeCarros} veículos atendidos    ║
║    • Receita total: ${formatCurrency(relatorioData.totalReceita)} ║
║    • Período: ${new Date(relatorioData.dataAbertura).toLocaleDateString('pt-BR')} a ${new Date(relatorioData.dataFechamento).toLocaleDateString('pt-BR')} ║
║                                                            ║
║  RELATÓRIO GERADO EM: ${new Date().toLocaleString('pt-BR').padEnd(25)} ║
║                                                            ║
╚══════════════════════════════════════════════════════════════╝
    `;

    await printContent(ticketContent, 'Relatório de Caixa');
  };

  // Função genérica de impressão
  const printContent = async (content: string, title: string) => {
    try {
      if ('print' in window) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${title} - IVT Park</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.2;
                  margin: 0;
                  padding: 10px;
                  background: white;
                }
                .ticket {
                  white-space: pre;
                  font-size: 10px;
                  line-height: 1.1;
                  width: 80mm;
                }
                @media print {
                  body { margin: 0; }
                  .ticket { 
                    font-size: 9px; 
                    width: 80mm;
                  }
                  @page {
                    size: 80mm auto;
                    margin: 5mm;
                  }
                }
              </style>
            </head>
            <body>
              <div class="ticket">${content}</div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => window.close(), 1000);
                };
              </script>
            </body>
            </html>
          `);
          printWindow.document.close();
        }
      } else {
        alert('Ticket gerado! Use Ctrl+P para imprimir.');
        console.log('Ticket:', content);
      }

      onPrintComplete();
      
    } catch (error) {
      console.error('Erro ao imprimir ticket:', error);
      alert('Erro ao imprimir ticket. Verifique a impressora.');
    }
  };

  // Renderiza o modal apropriado baseado no tipo
  const renderModal = () => {
    if (!data) return null;

    switch (type) {
      case 'entrada':
        const entradaData = data as TicketEntradaData;
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">🎫 Ticket de Entrada</h3>
            
            <div className="mb-4 text-sm space-y-2">
              <p><strong>Ticket ID:</strong> {entradaData.ticketId}</p>
              <p><strong>Placa:</strong> {entradaData.placa}</p>
              <p><strong>Modelo:</strong> {entradaData.modelo}</p>
              <p><strong>Vaga:</strong> {entradaData.lado}{entradaData.andar.toString().padStart(2, '0')}{entradaData.vaga.toString().padStart(2, '0')}</p>
              <p><strong>Entrada:</strong> {formatDate(entradaData.dataEntrada)}</p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={printTicketEntrada}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex-1"
              >
                🖨️ Imprimir Ticket
              </button>
              <button
                onClick={onPrintComplete}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded flex-1"
              >
                Fechar
              </button>
            </div>
          </div>
        );

      case 'saida':
        const saidaData = data as TicketSaidaData;
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">🚗 Ticket de Saída</h3>
            
            <div className="mb-4 text-sm space-y-2">
              <p><strong>Ticket ID:</strong> {saidaData.ticketId}</p>
              <p><strong>Placa:</strong> {saidaData.placa}</p>
              <p><strong>Modelo:</strong> {saidaData.modelo}</p>
              <p><strong>Vaga:</strong> {saidaData.lado}{saidaData.andar.toString().padStart(2, '0')}{saidaData.vaga.toString().padStart(2, '0')}</p>
              <p><strong>Entrada:</strong> {formatDate(saidaData.dataEntrada)}</p>
              <p><strong>Saída:</strong> {formatDate(saidaData.dataSaida)}</p>
              <p><strong>Tempo:</strong> {saidaData.diasEstacionado} dia(s)</p>
              <p><strong>Valor:</strong> {formatCurrency(saidaData.valorPago)}</p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={printTicketSaida}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1"
              >
                🖨️ Imprimir Ticket
              </button>
              <button
                onClick={onPrintComplete}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded flex-1"
              >
                Fechar
              </button>
            </div>
          </div>
        );

      case 'relatorio-caixa':
        const relatorioData = data as RelatorioCaixaData;
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold mb-4">📊 Relatório de Caixa</h3>
            
            <div className="mb-4 text-sm space-y-2">
              <p><strong>Caixa ID:</strong> {relatorioData.caixaId}</p>
              <p><strong>Operador:</strong> {relatorioData.operador}</p>
              <p><strong>Abertura:</strong> {formatDate(relatorioData.dataAbertura)}</p>
              <p><strong>Fechamento:</strong> {formatDate(relatorioData.dataFechamento)}</p>
              <p><strong>Saldo Inicial:</strong> {formatCurrency(relatorioData.saldoAbertura)}</p>
              <p><strong>Total Receita:</strong> {formatCurrency(relatorioData.totalReceita)}</p>
              <p><strong>Saldo Final:</strong> {formatCurrency(relatorioData.saldoFechamento)}</p>
              <p><strong>Carros Atendidos:</strong> {relatorioData.quantidadeCarros}</p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={printRelatorioCaixa}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex-1"
              >
                🖨️ Imprimir Relatório
              </button>
              <button
                onClick={onPrintComplete}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded flex-1"
              >
                Fechar
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {renderModal()}
    </div>
  );
}

// Funções auxiliares para criar os dados dos tickets
export const createTicketEntradaData = (
  placa: string,
  modelo: string,
  andar: number,
  lado: string,
  vaga: number,
  dataEntrada: string
): TicketEntradaData => ({
  placa: placa || 'N/A',
  modelo: modelo || 'N/A',
  andar,
  lado,
  vaga,
  dataEntrada,
  ticketId: `TK${Date.now().toString().slice(-8)}`,
});

export const createTicketSaidaData = (
  placa: string,
  modelo: string,
  andar: number,
  lado: string,
  vaga: number,
  dataEntrada: string,
  dataSaida: string,
  valorPago: number
): TicketSaidaData => ({
  placa: placa || 'N/A',
  modelo: modelo || 'N/A',
  andar,
  lado,
  vaga,
  dataEntrada,
  dataSaida,
  valorPago,
  diasEstacionado: calcularDias(dataEntrada, dataSaida), // Agora a função está disponível
  ticketId: `TK${Date.now().toString().slice(-8)}`,
});

export const createRelatorioCaixaData = (
  caixaId: number,
  operador: string,
  dataAbertura: string,
  dataFechamento: string,
  saldoAbertura: number,
  saldoFechamento: number,
  totalReceita: number,
  quantidadeCarros: number,
  transacoes: Array<{
    placa: string;
    modelo: string;
    dataEntrada: string;
    dataSaida: string;
    valorPago: number;
  }>
): RelatorioCaixaData => ({
  caixaId,
  operador,
  dataAbertura,
  dataFechamento,
  saldoAbertura,
  saldoFechamento,
  totalReceita,
  quantidadeCarros,
  transacoes,
});
