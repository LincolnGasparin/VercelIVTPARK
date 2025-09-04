"use client";
import React, { useState, useEffect } from 'react';
import { createCaixaAction } from './_actions/create-caixa';
import { statusCaixaAction } from './_actions/status_caixa';
import { closeCaixaAction } from './_actions/close-caixa';
import { getCaixaAction, type Caixas } from './_actions/get-caixa';
import { getTransacoesPorCaixaAction, type TransacaoDetalhe } from './_actions/get-transacoes-caixa';
import { TicketPrinter, createRelatorioCaixaData } from "@/components/ticket-printer";

const formatCurrency = (value: number | null) => {
  // Garante que não tentaremos formatar um valor inválido
  if (value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: Date | string | null) => {
  if (!dateString) return 'N/A';
  // Converte a string recebida do servidor para um objeto Date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Data inválida';
  return date.toLocaleString("pt-BR");
};

export default function Caixa() {
  const [statusCaixa, setStatusCaixa] = useState<"aberto" | "fechado">("fechado");
  const [caixaId, setCaixaId] = useState<string | null>(null);
  const [caixas, setCaixas] = useState<Caixas[]>([]);

  // Estados para o modal de detalhes
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [detalhesCaixa, setDetalhesCaixa] = useState<Caixas | null>(null);
  const [detalhesTransacoes, setDetalhesTransacoes] = useState<TransacaoDetalhe[]>([]);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const [showRelatorioModal, setShowRelatorioModal] = useState(false);
  const [relatorioData, setRelatorioData] = useState<RelatorioCaixaData | null>(null);

  useEffect(() => {
    // Função para verificar o status e buscar o histórico
    const fetchData = async () => {
      await verificarStatus();
      await fetchCaixas();
    };
    fetchData();
  }, []);

  async function verificarStatus() {
    const response = await statusCaixaAction();

    // Atualiza o estado do componente com a resposta do servidor
    setStatusCaixa(response.status);

    if (response.status === 'aberto' && response.id) {
      const idStr = response.id.toString();
      setCaixaId(idStr);
      // Agora que estamos no cliente, podemos usar o localStorage
      localStorage.setItem('caixaId', idStr);
    } else {
      setCaixaId(null);
      localStorage.removeItem('caixaId');
    }
  }

  async function abrirCaixa(formData: FormData) {
    const valorInicial = formData.get("valorInicial");
    const operador = formData.get("operador");

    if (!valorInicial || !operador) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    try {
      await createCaixaAction({
        saldo_abertura: Number(valorInicial),
        operador: String(operador),
      });
      // Atualiza o status e a lista após a criação
      await verificarStatus();
      await fetchCaixas();
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      alert("Falha ao abrir o caixa.");
    }
  }

  async function fetchCaixas() {
    try {
      const response: Caixas[] = await getCaixaAction();
      setCaixas(response);
    } catch (error) {
      console.error("Erro ao buscar caixas:", error);
    }
  };

  const handleCloseCaixa = async () => {
    if (!confirm("Tem certeza que deseja fechar o caixa atual?")) {
      return;
    }
    try {
      const caixaIdFromStorage = localStorage.getItem('caixaId');
      if (!caixaIdFromStorage) {
        alert("Nenhum caixa aberto para fechar.");
        return;
      }
      await closeCaixaAction(Number(caixaIdFromStorage));
      await verificarStatus(); // Re-verifica o status para atualizar a UI
      await fetchCaixas(); // Atualiza o histórico de caixas
      alert("Caixa fechado com sucesso!");
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      alert("Falha ao fechar o caixa.");
    }
  }

  // Handlers para o modal de detalhes
  const handleOpenDetalhesModal = async (caixa: Caixas) => {
    setIsLoadingModal(true);
    setDetalhesCaixa(caixa);
    setIsDetalhesModalOpen(true);
    try {
      const transacoes = await getTransacoesPorCaixaAction(caixa.id);
      setDetalhesTransacoes(transacoes);
    } catch (error) {
      console.error("Erro ao buscar detalhes do caixa:", error);
      alert("Não foi possível carregar os detalhes do caixa.");
    } finally {
      setIsLoadingModal(false);
    }
  };

  const handleCloseDetalhesModal = () => {
    setIsDetalhesModalOpen(false);
    setDetalhesCaixa(null);
    setDetalhesTransacoes([]);
  };

  const handleRelatorioPrintComplete = () => {
    setShowRelatorioModal(false);
    setRelatorioData(null);
  };

  return (
    <>
    <div id="caixa" className="container mx-auto p-6 ">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-6">Controle de Caixa</h2>
          <div className="mb-6">
            <span className={`px-3 py-1 rounded col-auto ${statusCaixa === "aberto" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
              {statusCaixa === "aberto" ? "Caixa Aberto" : "Caixa Fechado"}
               {caixaId ? ` (ID: ${caixaId})` : ''}
            </span>
          </div>
          {statusCaixa === "fechado" && (
          <div id="formAberturaCaixa" className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Abrir Caixa</h3>
            <form action={abrirCaixa}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <div>
                             <label className="block text-sm font-medium mb-2">Valor Inicial (R$)</label>
                             <input type="number" id="valorInicial" step="0.01" min="0" placeholder="0.00" className="w-full border rounded px-3 py-2" name='valorInicial' required />
                         </div>
                         <div>
                             <label className="block text-sm font-medium mb-2">Operador</label>
                             <input type="text" id="operador" placeholder="Nome do operador" className="w-full border rounded px-3 py-2" name='operador' required/>
                         </div>
                     </div>
                     <div className="flex space-x-4">
                         <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">Abrir Caixa</button>
                     </div>
                 </form>
            </div>
           
          )}
          {statusCaixa === "aberto" && (
            <div id="caixaAberto" className="">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                     <div className="bg-blue-100 p-4 rounded-lg">
                         <h3 className="text-lg font-semibold text-blue-800">Valor Inicial</h3>
                         <p className="text-2xl font-bold text-blue-600" id="valorInicialCaixa">R$ 0,00</p>
                     </div>
                     <div className="bg-green-100 p-4 rounded-lg">
                         <h3 className="text-lg font-semibold text-green-800">Receita do Dia</h3>
                         <p className="text-2xl font-bold text-green-600" id="receitaDiaCaixa">R$ 0,00</p>
                     </div>
                     <div className="bg-purple-100 p-4 rounded-lg">
                         <h3 className="text-lg font-semibold text-purple-800">Total em Caixa</h3>
                         <p className="text-2xl font-bold text-purple-600" id="totalCaixa">R$ 0,00</p>
                     </div>
                 </div>
                
                 <div className="flex space-x-4 mb-6">
                     <button onClick={handleCloseCaixa} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded">Fechar Caixa</button>
                     <button  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">Atualizar Valores</button>
                 </div>
             </div>
          )}
        </div>
    

        {/* <!-- Histórico de Caixas --> */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Histórico de Caixas</h3>
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left">Data</th>
                            <th className="px-4 py-2 text-left">Operador</th>
                            <th className="px-4 py-2 text-left">Data Abertura</th>
                            <th className="px-4 py-2 text-left">Data Fechamento</th>
                            <th className="px-4 py-2 text-left">Valor Inicial</th>
                            <th className="px-4 py-2 text-left">Receita</th>
                            <th className="px-4 py-2 text-left">Total Final</th>
                            <th className="px-4 py-2 text-left">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabelaHistoricoCaixas">
                        {caixas && caixas.length > 0 ? (
                            caixas.map((caixa) => (
                            <tr key={caixa.id} className="border-b hover:bg-gray-50 text-sm">
                                <td className="px-4 py-2">{formatDate(caixa.data_abertura)}</td>
                                <td className="px-4 py-2">{caixa.operador}</td>
                                <td className="px-4 py-2">{formatDate(caixa.data_abertura)}</td>
                                <td className="px-4 py-2">{formatDate(caixa.data_fechamento)}</td>
                                <td className="px-4 py-2 text-right">{formatCurrency(Number(caixa.saldo_abertura))}</td>
                                <td className="px-4 py-2 text-right">{formatCurrency(Number(caixa.saldo_fechamento))}</td>
                                <td className="px-4 py-2 text-right">{formatCurrency(Number(caixa.saldo_abertura) + Number(caixa.saldo_fechamento ?? 0))}</td>
                                <td className="px-4 py-2"><button onClick={() => handleOpenDetalhesModal(caixa)} className="text-blue-500 hover:underline">Detalhes</button></td>
                                </tr>
                            ))) : (
                            <tr>        
                                <td colSpan={8} className="px-4 py-2 text-center">Nenhum caixa registrado</td>
                            </tr>        
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    {/* Modal de Detalhes do Caixa */}
    {isDetalhesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold">Detalhes do Caixa #{detalhesCaixa?.id}</h3>
                    <button onClick={handleCloseDetalhesModal} className="text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                
                {isLoadingModal ? (
                    <div className="flex justify-center items-center h-64">
                        <p>Carregando detalhes...</p>
                    </div>
                ) : (
                    <div className="overflow-y-auto">
                        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <p><strong>Operador:</strong> {detalhesCaixa?.operador}</p>
                            <p><strong>Abertura:</strong> {formatDate(detalhesCaixa?.data_abertura || "N/A")}</p>
                            <p><strong>Fechamento:</strong> {formatDate(detalhesCaixa?.data_fechamento || "N/A")}</p>
                            <p><strong>Total Receita:</strong> {formatCurrency(Number(detalhesCaixa?.saldo_fechamento))}</p>
                        </div>
                        <h4 className="text-lg font-semibold mb-2 mt-4 border-t pt-2">Veículos com Saída no Período</h4>
                        <table className="w-full table-auto text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left">Placa</th>
                                    <th className="px-4 py-2 text-left">Modelo</th>
                                    <th className="px-4 py-2 text-left">Entrada</th>
                                    <th className="px-4 py-2 text-left">Saída</th>
                                    <th className="px-4 py-2 text-right">Valor Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detalhesTransacoes.length > 0 ? (
                                    detalhesTransacoes.map(t => (
                                        <tr key={t.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{t.placa_veiculo}</td>
                                            <td className="px-4 py-2">{t.modelo || 'N/A'}</td>
                                            <td className="px-4 py-2">{formatDate(t.data_entrada)}</td>
                                            <td className="px-4 py-2">{formatDate(t.data_saida)}</td>
                                            <td className="px-4 py-2 text-right">{formatCurrency(Number(t.valor_pago))}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4">Nenhuma saída registrada neste período.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                    <button onClick={handleCloseDetalhesModal} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* <!-- Modal de Relatório de Fechamento --> */}
    <div id="modalRelatorio" className="fixed inset-0 bg-black bg-opacity-50 modal hidden flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Relatório de Fechamento de Caixa</h3>
            <div id="relatorioConteudo">
                {/* <!-- Conteúdo será preenchido dinamicamente --> */}
            </div>
            <div className="flex space-x-4 mt-6">
                <button  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Confirmar Fechamento</button>
                <button  className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">Cancelar</button>
            </div>
        </div>
    </div>

    {/* Modal do Relatório de Caixa */}
    {showRelatorioModal && (
        <TicketPrinter
          type="relatorio-caixa"
          data={relatorioData}
          onPrintComplete={handleRelatorioPrintComplete}
        />
      )}
    </>
  );
}
