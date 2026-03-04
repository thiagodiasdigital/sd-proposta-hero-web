"use client";

import { useEffect, useState } from "react";
import styles from "./ProposalSections.module.css";

type Step = {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
};

const RODA_STEPS: Step[] = [
  {
    id: "r",
    title: "R - Raio-X",
    subtitle: "Onde a SD pode aparecer mais forte no Google?",
    bullets: [
      "Grid geografico: Espinheiros, Cordeiros, porto",
      "Analise concorrente: Cilesio + ALC",
      "GBP atual: ajustes imediatos",
    ],
  },
  {
    id: "o",
    title: "O - Oportunidades",
    subtitle: "Onde esta a demanda real de guindaste?",
    bullets: [
      "Porto: \"guindaste container Itajai\"",
      "Construcao: \"guindaste Cordeiros 24h\"",
      "Industria: \"remocao maquinas Itajai\"",
    ],
  },
  {
    id: "d",
    title: "D - Desenho",
    subtitle: "Como estruturar presenca dominante?",
    bullets: [
      "GBP com categorias especificas",
      "Paginas que capturam cada busca",
      "Provas que convertem curiosidade",
    ],
  },
  {
    id: "a",
    title: "A - Acao",
    subtitle: "Primeiro passo para dominar guindaste em Itajai",
    bullets: [
      "Correcao NAP/GBP imediata",
      "Expansao geografica planejada",
      "Backlog com ordem de execucao",
    ],
  },
];

export function ProposalSections() {
  const [activeSteps, setActiveSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setActiveSteps((current) => {
          const next = { ...current };
          let changed = false;

          for (const entry of entries) {
            const key = (entry.target as HTMLElement).dataset.stepId;
            if (!key || !entry.isIntersecting || next[key]) continue;
            next[key] = true;
            changed = true;
          }

          return changed ? next : current;
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -100px 0px",
      },
    );

    const targets = document.querySelectorAll("[data-step-id]");
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.proposalRoot}>
      <section className={`${styles.section} ${styles.section2}`} id="section2">
        <h2 className={styles.title}>Voce ja fez este teste simples?</h2>
        <p className={styles.subtitle}>
          Abra o Google e digite &quot;guindaste Itajai&quot;. O que voce ve em 1o e 2o lugar?
        </p>

        <div className={styles.googleTestCard}>
          <div className={styles.rankLabel}>1o LUGAR</div>
          <div className={styles.rankBox}>
            <strong>Cilesio Munck</strong>
            <br />
            Site otimizado + GBP dominante
          </div>
          <div className={styles.rankLabel}>2o LUGAR</div>
          <div className={styles.rankBox}>
            <strong>ALC Guindastes</strong>
            <br />
            Presenca em multiplos bairros
          </div>
          <div style={{ marginTop: "2rem", fontSize: "1.3rem", fontWeight: 600 }}>E a SD Guindastes esta onde?</div>
        </div>

        <a href="#section3" className={styles.ctaButton}>
          Quero entender isso melhor
        </a>
      </section>

      <section className={`${styles.section} ${styles.section3}`} id="section3">
        <h2 className={styles.title}>Cilesio Munck e ALC Guindastes lideram. O que eles fazem diferente?</h2>
        <p className={styles.subtitle}>
          Nao e magica. E metodo que qualquer empresa de guindaste pode replicar.
        </p>

        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonItem}>
            <h3>O que o cliente ve</h3>
            <ul className={styles.comparisonList}>
              <li>Telefone + WhatsApp visivel</li>
              <li>Horario 24h configurado</li>
              <li>Casos especificos (porto, container)</li>
              <li>Multiplas categorias GBP</li>
            </ul>
          </div>
          <div className={styles.comparisonItem}>
            <h3>SD Guindastes precisa verificar</h3>
            <ul className={`${styles.comparisonList} ${styles.dimmed}`}>
              <li>Esta tudo isso visivel?</li>
              <li>Aparece em todos os bairros?</li>
              <li>Tem paginas especificas?</li>
              <li>GBP esta otimizado?</li>
            </ul>
          </div>
        </div>

        <a href="#roda" className={styles.ctaButton}>
          Ver o metodo que supera isso
        </a>
      </section>

      <section className={`${styles.section} ${styles.rodaContainer}`} id="roda">
        <h2 className={styles.title} style={{ color: "white" }}>
          Metodo R.O.D.A.: o sistema por tras de 500+ empresas
        </h2>
        <p className={styles.subtitle} style={{ color: "#ddd" }}>
          Testado em negocios regionais que precisavam sair do anonimato digital
        </p>

        <div className={styles.rodaWrap}>
          {RODA_STEPS.map((step) => (
            <div
              key={step.id}
              data-step-id={step.id}
              className={`${styles.rodaStep} ${activeSteps[step.id] ? styles.rodaStepActive : ""}`}
            >
              <h3>{step.title}</h3>
              <p>{step.subtitle}</p>
              <ul>
                {step.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <a href="#escopo" className={`${styles.ctaButton} ${styles.goldCta}`}>
          O que Thiago recebe nesta fase
        </a>
      </section>

      <section className={`${styles.section} ${styles.section2}`} id="escopo">
        <h2 className={styles.title}>O que Thiago Deschamps recebe: R.O.D.A. Fase 1</h2>

        <div className={styles.scopeGrid}>
          <div className={styles.scopeCard}>
            <div className={styles.scopeIcon}>[Mapa]</div>
            <h3>Mapa geografico completo</h3>
            <p>Onde a SD aparece hoje e onde precisa dominar</p>
          </div>
          <div className={styles.scopeCard}>
            <div className={styles.scopeIcon}>[Busca]</div>
            <h3>Analise semantica concorrentes</h3>
            <p>Termos que Cilesio + ALC dominam (e voce pode tomar)</p>
          </div>
          <div className={styles.scopeCard}>
            <div className={styles.scopeIcon}>[Backlog]</div>
            <h3>Backlog priorizado</h3>
            <p>Ordem exata: o que fazer primeiro, segundo, terceiro</p>
          </div>
        </div>

        <div className={styles.offerBox}>
          <h3>Para: Thiago Deschamps - SD Guindastes</h3>
          <p>Entrega em 3 semanas | Investimento unico R$ 7.900</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.heroEnd}`}>
        <h2 className={styles.title} style={{ color: "white" }}>
          Thiago, pronto para dominar guindaste em Itajai?
        </h2>
        <p className={styles.subtitle} style={{ color: "#ddd" }}>
          Contratantes buscam no Google todos os dias. Vamos mostrar onde a SD pode liderar.
        </p>
        <a
          href="https://calendly.com/sua-agenda/30min"
          className={`${styles.ctaButton} ${styles.goldCta}`}
          style={{ fontSize: "1.3rem", padding: "22px 50px" }}
        >
          QUERO ESTRATEGIA
        </a>
        <p className={styles.footerNote}>Ou continue testando sozinho. A escolha e sua.</p>
      </section>
    </main>
  );
}
