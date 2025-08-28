import { getLeaveAction, type Leave } from "./_actions/get-leaves";
export const dynamic = "force-dynamic";

const calculateDays = (entrada: Date, saida: Date): number => {
  if (!saida || !entrada) return 0;
  // Calcula a diferença em milissegundos
  const diffTime = Math.abs(saida.getTime() - entrada.getTime());
  // Converte para dias e arredonda para cima
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // Um carro que entra e sai no mesmo dia deve contar como 1 dia
  return diffDays === 0 ? 1 : diffDays;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (date: Date) => {
  return date.toLocaleString("pt-BR");
};


export default async function Financeiro() {
  const leaves: Leave[] = await getLeaveAction();

  const now = new Date();

  // Helper para verificar se duas datas são no mesmo dia
  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  // --- Cálculos de Receita ---
  const receitaHoje = leaves
    .filter(leave => isSameDay(leave.data_saida, now))
    .reduce((sum, leave) => sum + Number(leave.valor_pago || 0), 0);

  const startOfWeek = new Date(now);
  // Define para o início da semana (Domingo)
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const receitaSemanal = leaves
    .filter(leave => {
      // Filtra transações desde o início da semana até agora
      return leave.data_saida >= startOfWeek;
    })
    .reduce((sum, leave) => sum + Number(leave.valor_pago || 0), 0);

  const receitaMensal = leaves
    .filter(leave => {
      // Filtra transações que ocorreram no mesmo mês e ano que a data atual
      return leave.data_saida.getMonth() === now.getMonth() && leave.data_saida.getFullYear() === now.getFullYear();
    })
    .reduce((sum, leave) => sum + Number(leave.valor_pago || 0), 0);

  return (
   <>
   <div id="financeiro" className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-6">Painel Financeiro</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800">Receita Hoje</h3>
                    <p className="text-2xl font-bold text-green-600" id="receitaHoje">{formatCurrency(receitaHoje)}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800">Receita Semanal</h3>
                    <p className="text-2xl font-bold text-blue-600" id="receitaSemanal">{formatCurrency(receitaSemanal)}</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800">Receita Mensal</h3>
                    <p className="text-2xl font-bold text-purple-600" id="receitaMensal">{formatCurrency(receitaMensal)}</p>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Histórico de Saídas</h3>
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left">Placa</th>
                            <th className="px-4 py-2 text-left">Modelo</th>
                            <th className="px-4 py-2 text-left">Entrada</th>
                            <th className="px-4 py-2 text-left">Saída</th>
                            <th className="px-4 py-2 text-left">Dias</th>
                            <th className="px-4 py-2 text-left">Valor Pago</th>
                        </tr>
                    </thead>
                    <tbody id="tabelaHistorico">
                        {leaves && leaves.length > 0 ? (
                          leaves.map((leave) => (
                            <tr key={leave.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{leave.placa_veiculo}</td>
                              <td className="px-4 py-2">{leave.modelo}</td>
                              <td className="px-4 py-2">
                                {formatDate(leave.data_entrada)}
                              </td>
                              <td className="px-4 py-2">
                                {formatDate(leave.data_saida)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {calculateDays(leave.data_entrada, leave.data_saida)}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {formatCurrency(leave.valor_pago)}
                              </td>
                            </tr>
                          ))) : (
                            <tr>
                              <td colSpan={6} className="px-4 py-2 text-center">
                                Nenhuma saída encontrada.
                              </td>
                            </tr>
                          )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
   </>
  );
}