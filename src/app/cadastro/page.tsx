"use client";
import { create } from "domain";
import React from "react";
import { useRef, useState } from "react";
import { createCadastroAction } from "./_actions/create-cadastro";


export default function Cadastro() {   

const [error, setError] = useState<string | null>(null);
const [sucesso, setSucesso] = useState<string | null>(null);

const totalAndares = 21;
const lados = ["A", "V"];
const vagasPorAndar = 6;

function getCurrentDateTimeLocal() {
  const now = new Date();
const pad = (n: number): string => n.toString().padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

async function cadastrarCarro(formData: FormData) {
    const placa = formData.get("placa");
    const modelo = formData.get("modelo");
    const andar = formData.get("andar");
    const lado = formData.get("lado");
    const vaga = formData.get("vaga");
    const horaEntrada = formData.get("horaEntrada");

    if (!horaEntrada || !andar || !lado || !vaga) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

const response = await createCadastroAction({
            caixaId: Number(localStorage.getItem('caixaId')),
            placa_veiculo: String(placa),
            modelo: String(modelo),
            andar: Number(andar),
            lado: String(lado),
            vaga: Number(vaga),
            data_entrada: String(horaEntrada),
        });
    if(response.error){
        setError(response.error);
        setSucesso(null);
    }else{
        setSucesso(response.data);
        setError(null);
    }
 
}




    return (
        <>
        <div id="cadastro" className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <form id="formCadastro" action={cadastrarCarro}>
            <div id="alertaCaixaFechado" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 hidden">
                ⚠️ O caixa está fechado! Abra o caixa primeiro para cadastrar carros.
            </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Placa do Carro</label>
                        <input type="text" id="placa" placeholder="ABC-1234" className="w-full border rounded px-3 py-2" name="placa"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Modelo do Carro</label>
                        <input type="text" id="modelo" placeholder="Ex: Honda Civic" className="w-full border rounded px-3 py-2" name="modelo" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Andar</label>
                       <select id="andarCadastro" className="w-full border rounded px-3 py-2" name="andar">
                            <option value="">Selecione o andar</option>
                            {Array.from({ length: totalAndares }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{`Andar ${i + 1}`}</option>
                            ))}
                            </select>
                    </div>
                    <div>
                            <label className="block text-sm font-medium mb-2">Lado</label>
                            <select id="ladoCadastro" className="w-full border rounded px-3 py-2" name="lado">
                                <option value="">Selecione o lado</option>
                                {lados.map(lado => (
                                <option key={lado} value={lado}>{`Lado ${lado}`}</option>
                                ))}
                            </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Vaga</label>
                        <select id="vagaCadastro" className="w-full border rounded px-3 py-2"   name="vaga">
                            <option value="">Selecione a vaga</option>
                            {Array.from({ length: vagasPorAndar }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{`Vaga ${i + 1}`}</option>
                            ))}
                            </select>
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Hora de Entrada</label>
                    <input type="datetime-local" id="horaEntrada" className="w-full border rounded px-3 py-2"  name="horaEntrada" defaultValue={getCurrentDateTimeLocal()}/>
                </div>
                <div className="flex space-x-4">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">Cadastrar</button>
                    <button type="button" className="bg-gray-500 hover:bg-gray-700 text-white px-6 py-2 rounded">Cancelar</button>
                    <div id="error">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">{error}</div>}

                    </div>
                     <div >
                      {sucesso && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">{sucesso}</div>}  
                    </div>
                    
                    
                </div>
            </form>
        </div>
    </div>
        </>
    );
}