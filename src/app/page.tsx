"use client";

import { useEffect, useRef, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import axios from "axios";

import { IVotingIntention } from "./interfaces";

export default function Home() {
  const newTheme = createTheme({ palette: { mode: "dark" } });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [votingIntention, setVotingIntention] =
    useState<IVotingIntention | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleOpenSelectFile = () => {
    fileInputRef.current?.click();
  };

  const getVotingIntentionData = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/voting-intention`
      );

      setVotingIntention(data.data);
    } catch (error) {
      console.error("Erro ao buscar dados da intenção de votos:", error);

      setVotingIntention(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVotingIntentionData();
  }, []);

  const changeFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      alert("Nenhum arquivo selecionado.");

      return;
    }

    const formData = new FormData();
    formData.append("survey", fileList[0]);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-survey`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Upload realizado com sucesso!");

      getVotingIntentionData();
    } catch (error) {
      console.error("Erro ao fazer upload da pesquisa:", error);

      alert("Erro ao realizar o upload. Tente novamente.");
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-end mb-4">
        <input
          ref={fileInputRef}
          id="input-file"
          className="hidden"
          type="file"
          accept=".csv"
          onChange={(e) => changeFile(e.target.files)}
        />

        <button
          className="border-[1px] border-[#094F93] bg-[#072645] text-[#5593D1] text-lg h-12 w-60 rounded"
          onClick={handleOpenSelectFile}
        >
          Atualizar
        </button>
      </div>

      <h1 className="text-4xl font-semibold mb-2">
        Pesquisa de intenção de votos.
      </h1>

      <p className="font-normal text-sm mb-6">
        Nossa aplicação inovadora oferece estimativas precisas da intenção de
        votos, com análises em tempo real sobre candidatos e tendências.
        Mantenha-se informado e faça sua voz ser ouvida nas eleições!
      </p>

      <div className="flex justify-center items-center min-h-80 bg-[#11171D] border-[#27313A] border-[1px] pt-6">
        <ThemeProvider theme={newTheme}>
          {loading ? (
            <span className="text-xl">Carregando dados...</span>
          ) : votingIntention ? (
            <BarChart
              barLabel={(item) => `${item.value}%`}
              xAxis={[{ scaleType: "band", data: votingIntention.label }]}
              series={Object.keys(votingIntention.percentages).map(
                (intention) => ({
                  data: votingIntention.percentages[intention],
                  label: intention,
                })
              )}
              height={400}
            />
          ) : (
            <span className="text-xl">
              Faça upload de uma pesquisa para visualizar a intenção de votos!
            </span>
          )}
        </ThemeProvider>
      </div>
    </div>
  );
}
