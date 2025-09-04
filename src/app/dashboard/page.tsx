"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getVagasOcupadasAction, VagaOcupada } from './_actions/get-vagas';
import { releaseVagaAction } from './_actions/release-vaga';
import { TicketPrinter, createTicketSaidaData } from "@/components/ticket-printer";


// A interface foi movida para o arquivo da action para ser compartilhada,
// mas a manteremos aqui como referência do que esperamos.
// interface VagaOcupada {
//   id: number;
//   placa_veiculo: string | null;
//   modelo: string | null;
//   andar: number;
//   lado: 'A' | 'V';
//   vaga: number;
//   data_entrada: Date;
// }

export default function Dashboard() {

  const totalAndares = 21;
  const lados = ["A", "V"]; // Corrigido de ["A", "V"] para corresponder aos filtros
  const vagasPorAndar = 6;
  const totalVagas = totalAndares * lados.length * vagasPorAndar;

  const [vagasOcupadas, setVagasOcupadas] = useState<VagaOcupada[]>([]);
  const [filtroAndar, setFiltroAndar] = useState('');
  const [filtroLado, setFiltroLado] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPlaca, setFiltroPlaca] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVaga, setSelectedVaga] = useState<VagaOcupada | null>(null);
  
  // Estados para confirmação e ticket
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [valorDiaria, setValorDiaria] = useState(25.00); // Valor configurável da diária

  useEffect(() => {
    async function fetchVagas() {
      try {
        const vagas = await getVagasOcupadasAction();
        setVagasOcupadas(vagas);
      } catch (error) {
        console.error("Erro ao buscar vagas ocupadas:", error);
      }
    }
    fetchVagas();
  }, []);

     // Otimiza a verificação de vagas ocupadas
  const occupiedSpots = useMemo(() => {
    const spotMap = new Map<string, VagaOcupada>();
    vagasOcupadas.forEach(v => {
      spotMap.set(`${v.andar}-${v.lado}-${v.vaga}`, v);
    });
    return spotMap;
  }, [vagasOcupadas]);

  const handleOpenModal = (vaga: VagaOcupada) => {
    setSelectedVaga(vaga);
    setShowConfirmModal(true); // Mostra modal de confirmação primeiro
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setSelectedVaga(null);
  };

  const handleConfirmarLiberacao = async () => {
    if (!selectedVaga) return;

    try {
      const result = await releaseVagaAction(selectedVaga.id);

      if (result.success) {
        // Calcula o valor baseado na diária configurável
        const dataEntrada = new Date(selectedVaga.data_entrada);
        const dataSaida = new Date();
        const diffMs = dataSaida.getTime() - dataEntrada.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const valorCalculado = diffDays * valorDiaria;

        // Cria dados do ticket de saída
        const ticket = createTicketSaidaData(
          selectedVaga.placa_veiculo || 'N/A',
          selectedVaga.modelo || 'N/A',
          selectedVaga.andar,
          selectedVaga.lado,
          selectedVaga.vaga,
          selectedVaga.data_entrada.toISOString(),
          dataSaida.toISOString(),
          valorCalculado
        );
        
        setTicketData(ticket);
        setShowTicketModal(true);
        handleCloseModal(); // Fecha modal de confirmação
        
        // Atualiza a lista de vagas
        const vagas = await getVagasOcupadasAction();
        setVagasOcupadas(vagas);
        
      } else {
        alert(`Erro: ${result.message}`);
      }
    } catch (error) {
      console.error("Erro ao liberar vaga:", error);
      alert("Erro ao liberar vaga. Tente novamente.");
    }
  };

  const handleTicketPrintComplete = () => {
    setShowTicketModal(false);
    setTicketData(null);
  };

  const handleLimparFiltros = () => {
    setFiltroAndar('');
    setFiltroLado('');
    setFiltroStatus('');
    setFiltroPlaca('');
  };

  const numVagasOcupadas = vagasOcupadas.length;
  const vagasLivres = totalVagas - numVagasOcupadas;
  const taxaOcupacao = totalVagas > 0 ? ((numVagasOcupadas / totalVagas) * 100).toFixed(1) : "0";
   
  return (
    <>
      <div id="dashboard" className="container mx-auto p-6">
        {/* Configurações da Diária */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">⚙️ Configurações</h3>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-600">Valor da Diária:</label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorDiaria}
                  onChange={(e) => setValorDiaria(parseFloat(e.target.value) || 25.00)}
                  className="w-20 border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Cards de Estatísticas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Total de Vagas</h3>
            <p className="text-3xl font-bold text-blue-600">{totalVagas}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Vagas Ocupadas</h3>
            <p className="text-3xl font-bold text-red-600" id="vagasOcupadas">{numVagasOcupadas}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Vagas Livres</h3>
            <p className="text-3xl font-bold text-green-600" id="vagasLivres">{vagasLivres}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Taxa de Ocupação</h3>
            <p className="text-3xl font-bold text-purple-600" id="taxaOcupacao">{taxaOcupacao}%</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select id="filtroAndar" className="border rounded px-3 py-2" value={filtroAndar} onChange={e => setFiltroAndar(e.target.value)}>
              <option value="">Todos os Andares</option>
              {Array.from({ length: totalAndares }, (_, i) => (
                <option key={i + 1} value={i + 1}>{`Andar ${i + 1}`}</option>
              ))}
            </select>
            <select id="filtroLado" className="border rounded px-3 py-2" value={filtroLado} onChange={e => setFiltroLado(e.target.value)}>
              <option value="">Todos os Lados</option>
              <option value="A">Lado A</option>
              <option value="V">Lado V</option>
            </select>
            <select id="filtroStatus" className="border rounded px-3 py-2" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="">Todos os Status</option>
              <option value="livre">Livres</option>
              <option value="ocupada">Ocupadas</option>
            </select>
            <input
              type="text"
              placeholder="Buscar por Placa"
              className="border rounded px-3 py-2"
              value={filtroPlaca}
              onChange={e => setFiltroPlaca(e.target.value)}
            />
            <button onClick={handleLimparFiltros} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded col-span-1 md:col-start-5">Limpar Filtros</button>
          </div>
        </div>

        {/* Visualização das Vagas */}
        <div id="vagasVisualizacao" className="max-h-96 overflow-y-auto space-y-6 border rounded-lg p-4">
          {Array.from({ length: totalAndares }, (_, andarIdx) => {
            const andar = andarIdx + 1;
            if (filtroAndar && andar.toString() !== filtroAndar) {
              return null;
            }

            return (
              <div key={andar} className="mb-4">
                <h4 className="font-bold mb-2 text-xl text-center">{`Andar ${andar}`}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
                  {lados.map(lado => {
                    if (filtroLado && lado !== filtroLado) {
                      return null;
                    }
                    return (
                      <div key={lado}>
                        <h5 className="font-semibold text-center mb-2">{`Lado ${lado === 'A' ? 'Amarelo' : 'Verde'}`}</h5>
                        <div className="grid grid-cols-3 gap-2 bg-gray-100 p-2 rounded-md">
                          {Array.from({ length: vagasPorAndar }, (_, vagaIdx) => {
                            const vaga = vagaIdx + 1;
                            const spotDetails = occupiedSpots.get(`${andar}-${lado}-${vaga}`);
                            const isOccupied = !!spotDetails;

                            if (filtroStatus === 'livre' && isOccupied) return null;
                            if (filtroStatus === 'ocupada' && !isOccupied) return null;

                            if (filtroPlaca && isOccupied && 
                                !spotDetails.placa_veiculo?.toLowerCase().includes(filtroPlaca.toLowerCase())) {
                              return null;
                            }

                            return (
                              <div key={vaga} onClick={() => isOccupied && handleOpenModal(spotDetails)} className={`p-2 rounded text-white shadow-sm flex flex-col justify-center min-h-[110px] ${isOccupied ? 'bg-red-500 hover:bg-red-600 cursor-pointer' : 'bg-green-500 hover:bg-green-600'}`}>
                                {isOccupied ? (
                                  <div className="text-xs text-left space-y-1">
                                    <p className='text-center text-lg'><strong className="font-bold text-lg">Vaga:</strong> {`${lado}${andar}0${vaga}`}</p>
                                    <p className=''><strong>Placa:</strong> {spotDetails.placa_veiculo || 'N/A'}</p>
                                    <p><strong>Modelo:</strong> {spotDetails.modelo || 'N/A'}</p>
                                    <p><strong>Entrada:</strong> {new Date(spotDetails.data_entrada).toLocaleString('pt-BR')}</p>
                                  </div>
                                ) : (
                                  <div className="text-center font-bold text-lg">
                                    {`${lado}${andar}0${vaga}`}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && selectedVaga && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-red-600">⚠️ Confirmar Liberação</h3>
            <div className="space-y-2 text-gray-800 mb-6">
              <p><strong>Vaga:</strong> {`${selectedVaga.lado}${selectedVaga.andar.toString().padStart(2, '0')}${selectedVaga.vaga.toString().padStart(2, '0')}`}</p>
              <p><strong>Placa:</strong> {selectedVaga.placa_veiculo || 'N/A'}</p>
              <p><strong>Modelo:</strong> {selectedVaga.modelo || 'N/A'}</p>
              <p><strong>Entrada:</strong> {new Date(selectedVaga.data_entrada).toLocaleString('pt-BR')}</p>
              <p><strong>Tempo Estacionado:</strong> {Math.ceil((new Date().getTime() - new Date(selectedVaga.data_entrada).getTime()) / (1000 * 60 * 60 * 24))} dia(s)</p>
              <p><strong>Valor a Pagar:</strong> R$ {Math.ceil((new Date().getTime() - new Date(selectedVaga.data_entrada).getTime()) / (1000 * 60 * 60 * 24)) * valorDiaria},00</p>
            </div>
            <div className="flex space-x-4">
              <button onClick={handleCloseModal} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded flex-1">
                Cancelar
              </button>
              <button onClick={handleConfirmarLiberacao} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex-1">
                ✅ Confirmar e Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Ticket de Saída (agora só para impressão automática) */}
      {showTicketModal && (
        <TicketPrinter
          type="saida"
          data={ticketData}
          onPrintComplete={handleTicketPrintComplete}
        />
      )}
    </>
  );
}