"use client";

import { useEffect, useState } from "react";
import styles from "./ProposalSections.module.css";

type RevealBlock = {
  id: string;
  title: string;
  text: string;
};

const TIMELINE: RevealBlock[] = [
  {
    id: "fase1",
    title: "Fase 1 (Diagnóstico e Infraestrutura)",
    text:
      "Correção do seu ecossistema no Google (NAP, categorias ocultas, transferência de autoridade social) para dominar a busca local.",
  },
  {
    id: "fase2",
    title: "Fase 2 (Engenharia de Conversão)",
    text:
      "Construção de ativos digitais rastreáveis. Nota de telemetria: exatamente como sabemos em qual segundo desta página você está lendo este texto agora, você saberá quando a indústria abrir a sua proposta.",
  },
  {
    id: "fase3",
    title: "Fase 3 (Qualificação MEDDIC)",
    text:
      "Implementação de filtros para que sua equipe só invista tempo de negociação com indústrias que tenham orçamento aprovado e decisor mapeado.",
  },
];

export function ProposalSections() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisible((current) => {
          const next = { ...current };
          let changed = false;

          for (const entry of entries) {
            const key = (entry.target as HTMLElement).dataset.revealId;
            if (!key || !entry.isIntersecting || next[key]) continue;
            next[key] = true;
            changed = true;
          }

          return changed ? next : current;
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -80px 0px" },
    );

    const targets = document.querySelectorAll("[data-reveal-id]");
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.root}>
      <section id="dobra1" className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.splitGrid}>
          <div className={styles.mediaCard}>
            <video className={styles.mediaVideo} autoPlay muted loop playsInline preload="metadata">
              <source src="/videos/FINAL.mp4" type="video/mp4" />
            </video>
            <p className={styles.mediaLabel}>Operacao real da SD em acao</p>
          </div>

          <div className={styles.mediaCard}>
            <div className={styles.searchMock}>
              <p className={styles.searchTitle}>Google: &quot;guindaste Itajai&quot;</p>
              <div className={styles.searchItem}>SD enquadrada como transportadora generica</div>
              <div className={styles.searchItem}>Concorrentes com arquitetura focada em servico pesado</div>
            </div>
            <p className={styles.mediaLabel}>Leitura algoritmica atual do mercado</p>
          </div>
        </div>

        <h2 className={styles.title}>[DOBRA 1] O Gap Operacional: Assimetria entre Máquina e Algoritmo</h2>
        <p className={styles.text}>
          (Ação do Scroll: A tela divide ao meio. À esquerda, um vídeo em loop da SD içando uma câmara fria pesada.
          À direita, um print real das buscas do Google mostrando a SD categorizada como uma &quot;transportadora&quot;
          genérica.)
        </p>
        <p className={styles.text}>
          A sua realidade operacional não reflete a sua identidade digital.
        </p>
        <p className={styles.text}>
          Na rua, a SD Guindastes executa engenharia de movimentação crítica e içamento de alto risco. Para os
          algoritmos do Google e para os tomadores de decisão das indústrias, vocês estão enquadrados como uma
          transportadora genérica de bairro.
        </p>
        <p className={styles.text}>
          Essa assimetria algorítmica destrói a percepção de valor do seu maquinário. Enquanto você não dominar a
          intenção de busca corporativa, sua operação continuará sendo precificada por &quot;hora/máquina&quot; em vez
          de &quot;risco mitigado&quot;.
        </p>
      </section>

      <section id="dobra2" className={`${styles.section} ${styles.mapSection}`}>
        <h2 className={styles.title}>[DOBRA 2] A Hemorragia de Capital: O Mapa da Concorrência</h2>
        <p className={styles.text}>
          (Ação do Scroll: O fundo escurece e revela um mapa topográfico escuro de Itajaí. Áreas estratégicas como
          Cordeiros e Ressacada acendem em vermelho, mostrando a posição de domínio orgânico da concorrência.)
        </p>
        <p className={styles.text}>
          O capital industrial não flui para quem tem o melhor equipamento, flui para quem intercepta o decisor
          primeiro.
        </p>

        <div className={styles.mapPanel}>
          <div className={styles.hotspot}>Cordeiros: domínio orgânico da Cilesio Munck</div>
          <div className={styles.hotspot}>Ressacada: captura industrial da ALC Guindastes</div>
        </div>

        <p className={styles.text}>
          Auditoria técnica revela que a demanda de alto ticket na sua região já está sendo capturada. A Cilesio
          Munck domina a região de Cordeiros com uma arquitetura de oferta focada em &quot;serviço pesado local&quot;.
          A ALC Guindastes captura a demanda industrial na Ressacada.
        </p>
        <p className={styles.text}>
          Eles não possuem superioridade técnica sobre a SD. Eles possuem superioridade de posicionamento.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Como o Mercado Funciona</th>
                <th>Como a SD Opera Hoje</th>
                <th>O Modelo de Engenharia B2B</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Origem da Demanda</td>
                <td>Passiva (Depende de Instagram e indicação)</td>
                <td>Ativa (Intercepta a intenção de busca no Google)</td>
              </tr>
              <tr>
                <td>Processo de Venda</td>
                <td>Orçamento solto via WhatsApp (sem rastreio)</td>
                <td>Ambientes controlados com telemetria (como esta página)</td>
              </tr>
              <tr>
                <td>Posicionamento</td>
                <td>Concorre com fretes e transportes comuns</td>
                <td>Especialista isolado em içamento e montagem industrial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="dobra3" className={`${styles.section} ${styles.lightSection}`}>
        <h2 className={styles.title}>[DOBRA 3] O Mecanismo de Alavancagem: A Matemática 20-20-20</h2>
        <p className={styles.text}>
          (Ação do Scroll: O mapa desbota e dá lugar a um diagrama interativo de três engrenagens (Aquisição,
          Frequência, Ticket). Conforme o usuário rola a página, as engrenagens giram e o número central sobe para
          +72,8%).
        </p>
        <p className={styles.text}>
          Marketing baseado em &quot;achismo&quot; custa caro. Nós operamos com engenharia de receita baseada na regra
          matemática 20-20-20.
        </p>

        <div className={styles.gearRow}>
          <div className={styles.gearCard}>+20% em Aquisição</div>
          <div className={styles.gearCard}>+20% em Frequência</div>
          <div className={styles.gearCard}>+20% em Ticket Médio</div>
        </div>

        <div className={styles.compoundResult}>Efeito composto projetado: +72,8%</div>

        <div className={styles.bulletBlock}>
          <p>
            Não precisamos dobrar o seu esforço comercial para dobrar seu caixa. Precisamos otimizar três alavancas de
            forma simultânea.
          </p>
          <p>
            +20% em Aquisição: Estruturamos seu Google Business Profile para ranquear em buscas de alto valor
            (içamento industrial), parando de perder leads qualificados.
          </p>
          <p>
            +20% em Frequência: Implementamos cadências de reativação (pós-venda e manutenções programadas) para a sua
            base atual de clientes industriais.
          </p>
          <p>
            +20% em Ticket Médio: Transformamos o &quot;aluguel de munck&quot; em pacotes fechados de solução logística,
            ancorando o preço na resolução do problema e não na hora trabalhada.
          </p>
          <p>
            O efeito composto dessas três alavancas rodando juntas gera um aumento projetado de 72,8% na receita final
            da sua operação.
          </p>
        </div>
      </section>

      <section id="dobra4" className={`${styles.section} ${styles.darkSection}`}>
        <h2 className={styles.title}>[DOBRA 4] Governança e Roadmap de Implementação</h2>
        <p className={styles.text}>
          (Ação do Scroll: Uma linha do tempo técnica se desenha verticalmente. Os textos surgem em blocos curtos,
          respeitando a carga cognitiva do comprador).
        </p>
        <p className={styles.text}>
          O improviso termina aqui. A implementação deste sistema exige governança técnica e fases rigorosas de
          execução:
        </p>

        <div className={styles.timeline}>
          {TIMELINE.map((phase) => (
            <article
              key={phase.id}
              data-reveal-id={phase.id}
              className={`${styles.timelineItem} ${visible[phase.id] ? styles.visible : ""}`}
            >
              <h3>{phase.title}</h3>
              <p>{phase.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="dobra5" className={`${styles.section} ${styles.ctaSection}`}>
        <h2 className={styles.title}>[DOBRA 5] Acordo de Execução (CTA)</h2>
        <p className={styles.text}>
          (Ação do Scroll: Fundo limpo, tipografia grande. Foco total na decisão lógica).
        </p>
        <p className={styles.text}>
          Cada dia de inércia é um contrato de içamento de alto ticket que o algoritmo entrega para a sua concorrência.
        </p>
        <p className={styles.text}>
          Esta não é uma proposta de comunicação visual. É um projeto de alavancagem de receita através de
          posicionamento de dados. O escopo técnico e a arquitetura do projeto já foram auditados.
        </p>
        <p className={styles.text}>
          Para acionar a nossa equipe técnica e iniciar a Fase 1 de implementação na SD Guindastes, confirme sua
          decisão abaixo.
        </p>

        <a href="https://calendly.com/sua-agenda/30min" className={styles.ctaButton}>
          QUERO IMPLEMENTAR
        </a>
      </section>
    </main>
  );
}
