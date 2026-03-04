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
    title: "Fase 1 - Diagnostico e Infraestrutura",
    text:
      "Correcao do ecossistema no Google (NAP, categorias ocultas, transferencia de autoridade social) para dominar a busca local.",
  },
  {
    id: "fase2",
    title: "Fase 2 - Engenharia de Conversao",
    text:
      "Construcao de ativos digitais rastreaveis, com telemetria para saber quando e como cada industria interage com sua proposta.",
  },
  {
    id: "fase3",
    title: "Fase 3 - Qualificacao MEDDIC",
    text:
      "Filtros para que a equipe negocie apenas com industrias que tenham orcamento aprovado e decisor mapeado.",
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

        <h2 className={styles.title}>[DOBRA 1] O Gap Operacional: Assimetria entre Maquina e Algoritmo</h2>
        <p className={styles.text}>
          A sua realidade operacional nao reflete a sua identidade digital. Na rua, a SD executa engenharia de
          movimentacao critica e icamento de alto risco. Para algoritmos e decisores industriais, a marca esta
          enquadrada como uma transportadora generica.
        </p>
        <p className={styles.text}>
          Essa assimetria algoritmica reduz percepcao de valor. Enquanto a intencao de busca corporativa nao for
          dominada, a operacao segue precificada por &quot;hora/maquina&quot; em vez de
          &quot;risco mitigado&quot;.
        </p>
      </section>

      <section id="dobra2" className={`${styles.section} ${styles.mapSection}`}>
        <h2 className={styles.title}>[DOBRA 2] A Hemorragia de Capital: O Mapa da Concorrencia</h2>
        <p className={styles.text}>
          O capital industrial nao flui para quem tem o melhor equipamento. Flui para quem intercepta o decisor
          primeiro.
        </p>

        <div className={styles.mapPanel}>
          <div className={styles.hotspot}>Cordeiros: dominio Cilesio Munck</div>
          <div className={styles.hotspot}>Ressacada: captura industrial ALC</div>
        </div>

        <p className={styles.text}>
          Eles nao possuem superioridade tecnica sobre a SD. Eles possuem superioridade de posicionamento.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Como o Mercado Funciona</th>
                <th>Como a SD Opera Hoje</th>
                <th>Modelo de Engenharia B2B</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Origem da Demanda</td>
                <td>Passiva (Instagram e indicacao)</td>
                <td>Ativa (intercepta busca no Google)</td>
              </tr>
              <tr>
                <td>Processo de Venda</td>
                <td>Orcamento solto via WhatsApp</td>
                <td>Ambiente rastreavel com telemetria</td>
              </tr>
              <tr>
                <td>Posicionamento</td>
                <td>Concorre com frete comum</td>
                <td>Especialista em icamento industrial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="dobra3" className={`${styles.section} ${styles.lightSection}`}>
        <h2 className={styles.title}>[DOBRA 3] O Mecanismo de Alavancagem: A Matematica 20-20-20</h2>
        <p className={styles.text}>
          Marketing baseado em achismo custa caro. O sistema opera com engenharia de receita na regra matematica
          20-20-20.
        </p>

        <div className={styles.gearRow}>
          <div className={styles.gearCard}>+20% Aqusicao</div>
          <div className={styles.gearCard}>+20% Frequencia</div>
          <div className={styles.gearCard}>+20% Ticket Medio</div>
        </div>

        <div className={styles.compoundResult}>Efeito composto projetado: +72.8%</div>

        <div className={styles.bulletBlock}>
          <p>
            +20% em Aquisicao: Google Business Profile para buscas de alto valor (icamento industrial).
          </p>
          <p>
            +20% em Frequencia: cadencias de reativacao na base atual (pos-venda e manutencoes programadas).
          </p>
          <p>
            +20% em Ticket Medio: pacotes de solucao logistica, ancorando preco no problema resolvido.
          </p>
        </div>
      </section>

      <section id="dobra4" className={`${styles.section} ${styles.darkSection}`}>
        <h2 className={styles.title}>[DOBRA 4] Governanca e Roadmap de Implementacao</h2>
        <p className={styles.text}>
          O improviso termina aqui. A implementacao exige governanca tecnica e fases rigorosas de execucao.
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
        <h2 className={styles.title}>[DOBRA 5] Acordo de Execucao</h2>
        <p className={styles.text}>
          Cada dia de inercia e um contrato de icamento de alto ticket que o algoritmo entrega para a concorrencia.
        </p>
        <p className={styles.text}>
          Esta nao e uma proposta de comunicacao visual. E um projeto de alavancagem de receita atraves de
          posicionamento de dados.
        </p>
        <p className={styles.text}>
          Para acionar a equipe tecnica e iniciar a Fase 1 de implementacao na SD Guindastes, confirme sua decisao
          abaixo.
        </p>

        <a href="https://calendly.com/sua-agenda/30min" className={styles.ctaButton}>
          QUERO IMPLEMENTAR
        </a>
      </section>
    </main>
  );
}
