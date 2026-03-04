"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import styles from "./ProposalSections.module.css";

const SEARCH_QUERY = "aluguel de munck Itajai";
const SESSION_KEY = "roda_session";
const CTA_BASE = "https://wa.me/5532998494311";

type TelemetryEvent = Record<string, string | number>;

function nowIso(): string {
  return new Date().toISOString();
}

function safeReadEvents(): TelemetryEvent[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteEvents(events: TelemetryEvent[]): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(events));
  } catch {
    // ignore write failures in privacy modes
  }
}

export function ProposalSections() {
  const [typed, setTyped] = useState("");
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});
  const [mapVisible, setMapVisible] = useState(false);
  const [sdPointVisible, setSdPointVisible] = useState(false);
  const [counter, setCounter] = useState(0);

  const sessionStartRef = useRef<number>(0);
  const seenFoldsRef = useRef<Set<string>>(new Set());
  const seenDepthRef = useRef<Set<number>>(new Set());
  const currentFoldRef = useRef<string | null>(null);
  const currentFoldStartRef = useRef<number>(0);
  const counterStartedRef = useRef(false);

  useEffect(() => {
    sessionStartRef.current = Date.now();
    currentFoldStartRef.current = Date.now();

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(SEARCH_QUERY.slice(0, index));
      if (index >= SEARCH_QUERY.length) window.clearInterval(timer);
    }, 55);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const pushEvent = (event: TelemetryEvent) => {
      const all = safeReadEvents();
      all.push(event);
      safeWriteEvents(all);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        setVisibleIds((current) => {
          const next = { ...current };
          let changed = false;

          for (const entry of entries) {
            const revealId = (entry.target as HTMLElement).dataset.revealId;
            if (!revealId || !entry.isIntersecting || next[revealId]) continue;
            next[revealId] = true;
            changed = true;
          }

          return changed ? next : current;
        });
      },
      { threshold: 0.15 },
    );

    const foldObserver = new IntersectionObserver(
      (entries) => {
        const visibleFold = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          .at(0);

        if (!visibleFold) return;

        const foldId = (visibleFold.target as HTMLElement).id;
        if (!foldId) return;

        if (!seenFoldsRef.current.has(foldId)) {
          seenFoldsRef.current.add(foldId);
          pushEvent({ evento: "dobra_vista", dobra: foldId, timestamp: nowIso() });
        }

        if (currentFoldRef.current !== foldId) {
          if (currentFoldRef.current) {
            const seconds = Math.max(1, Math.round((Date.now() - currentFoldStartRef.current) / 1000));
            pushEvent({ evento: "tempo_dobra", dobra: currentFoldRef.current, segundos: seconds });
          }
          currentFoldRef.current = foldId;
          currentFoldStartRef.current = Date.now();
        }

        if (foldId === "dobra-mapa") {
          setMapVisible(true);
          window.setTimeout(() => setSdPointVisible(true), 600);
        }

        if (foldId === "dobra-metodo" && !counterStartedRef.current) {
          counterStartedRef.current = true;
          const start = performance.now();
          const duration = 2000;
          const animate = (ts: number) => {
            const t = Math.min(1, (ts - start) / duration);
            const eased = 1 - (1 - t) ** 4;
            setCounter(72.8 * eased);
            if (t < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 },
    );

    const revealTargets = document.querySelectorAll("[data-reveal-id]");
    revealTargets.forEach((target) => revealObserver.observe(target));

    const foldTargets = document.querySelectorAll("section[id^='dobra-']");
    foldTargets.forEach((target) => foldObserver.observe(target));

    const onScroll = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const pct = Math.round((window.scrollY / maxScroll) * 100);
      [25, 50, 75, 100].forEach((mark) => {
        if (pct >= mark && !seenDepthRef.current.has(mark)) {
          seenDepthRef.current.add(mark);
          pushEvent({ evento: "scroll_profundidade", porcentagem: mark, timestamp: nowIso() });
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
      foldObserver.disconnect();

      if (currentFoldRef.current) {
        const seconds = Math.max(1, Math.round((Date.now() - currentFoldStartRef.current) / 1000));
        pushEvent({ evento: "tempo_dobra", dobra: currentFoldRef.current, segundos: seconds });
      }
    };
  }, []);

  const onCtaClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const events = safeReadEvents();
    events.push({ evento: "cta_clique", timestamp: nowIso() });

    const sessionSeconds = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 1000));
    safeWriteEvents(events);

    const payload = JSON.stringify({ sessao_segundos: sessionSeconds, eventos: events });
    const text = `Ola, quero implementar o Metodo R.O.D.A. na SD Guindastes. Sessao: ${sessionSeconds}s. Telemetria: ${payload}`;
    const targetUrl = `${CTA_BASE}?text=${encodeURIComponent(text)}`;

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className={styles.rodaRoot}>
      <section id="dobra-decisao" className={styles.rodaSection}>
        <div className={`${styles.rodaGrid} ${styles.rodaReveal} ${visibleIds.decisao_grid ? styles.rodaVisible : ""}`} data-reveal-id="decisao_grid">
          <article className={styles.rodaPanel}>
            <div className={styles.rodaSearchBar}>{typed}<span className={styles.rodaCaret}>|</span></div>
            <div className={styles.rodaResult}>#1 Empresa A</div>
            <div className={styles.rodaResult}>#2 Empresa B</div>
            <div className={styles.rodaResult}>#3 Empresa C</div>
            <div className={styles.rodaMissing}>Sua empresa deveria estar aqui.</div>
          </article>

          <article className={styles.rodaPanel}>
            <div className={styles.rodaChatPrompt}>Qual empresa de icamento industrial eu contrato em Itajai?</div>
            <div className={styles.rodaChatAnswer}>1) Empresa A<br />2) Empresa B<br />3) Empresa C</div>
          </article>
        </div>

        <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.decisao_h2 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_h2">
          A decisao de contratar comeca <strong>antes</strong> do seu telefone tocar.
        </h2>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.decisao_p1 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p1">
          Quando um engenheiro de obras, gerente de logistica portuaria ou responsavel por montagem industrial em Itajai precisa de icamento com urgencia, ele nao abre o Instagram.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.decisao_p2 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p2">
          Ele busca no Google. Ou faz a pergunta direto para uma Inteligencia Artificial.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.decisao_p3 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p3">
          Em menos de tres segundos, a decisao ja comeca. Quem aparece no topo do mapa e quem e recomendado pela IA recebe o contato. Quem aparece depois disputa o que sobrou.
        </p>
        <p className={`${styles.rodaHighlight} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.decisao_p4 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p4">
          As empresas que hoje ocupam esses resultados nao chegaram la por ter o melhor equipamento. Chegaram porque trataram o posicionamento digital como infraestrutura operacional - do mesmo jeito que tratam a manutencao da frota.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaBold} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.decisao_p5 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p5">
          A SD Guindastes tem a frota e a operacao. Falta a engenharia de dados que traduz essa capacidade para os algoritmos modernos.
        </p>
      </section>

      <section id="dobra-mapa" className={`${styles.rodaSection} ${styles.rodaMapBg}`}>
        <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.mapa_h2 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_h2">
          O espaco existe. A demanda ja esta la. <strong>Falta o posicionamento.</strong>
        </h2>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.mapa_p1 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_p1">
          O mercado de icamento industrial, montagem de galpoes e locacao de munck em Itajai tem demanda real, crescente e subestimada digitalmente.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.mapa_p2 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_p2">
          Empresas que hoje estao a frente capturaram as primeiras posicoes por ausencia de concorrencia tecnica. Nao por superioridade de equipamento. Nao por preco menor. Nao por mais anos de mercado.
        </p>

        <div className={`${styles.rodaSvgWrap} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.mapa_svg ? styles.rodaVisible : ""}`} data-reveal-id="mapa_svg">
          <svg viewBox="0 0 360 220" className={styles.rodaSvg} aria-hidden="true">
            <rect x="20" y="20" width="90" height="70" />
            <rect x="130" y="20" width="95" height="55" />
            <rect x="245" y="20" width="95" height="80" />
            <rect x="35" y="110" width="110" height="85" />
            <rect x="165" y="95" width="80" height="95" />
            <rect x="260" y="115" width="75" height="75" />
            <line x1="20" y1="105" x2="340" y2="105" />
            <line x1="155" y1="20" x2="155" y2="200" />
          </svg>

          {mapVisible && (
            <>
              <div className={`${styles.rodaPoint} ${styles.rodaCompetitor}`} style={{ left: "17%", top: "30%" }}>
                <span>Concorrente</span>
              </div>
              <div className={`${styles.rodaPoint} ${styles.rodaCompetitor}`} style={{ left: "66%", top: "24%" }}>
                <span>Concorrente</span>
              </div>
              <div className={`${styles.rodaPoint} ${styles.rodaCompetitor}`} style={{ left: "74%", top: "69%" }}>
                <span>Concorrente</span>
              </div>
            </>
          )}

          {sdPointVisible && (
            <div className={`${styles.rodaPoint} ${styles.rodaSd}`} style={{ left: "48%", top: "49%" }}>
              <span>SD Guindastes</span>
              <i className={styles.rodaRipple} />
            </div>
          )}
        </div>

        <p className={`${styles.rodaHighlight} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.mapa_p3 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_p3">
          Ha uma lacuna no posicionamento delas: estao otimizadas para o Google de ontem. A janela que se abre agora e o SEO Local avancado cruzado com AIO - Artificial Intelligence Optimization.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.mapa_p4 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_p4">
          Isso significa nao apenas aparecer no mapa quando alguem busca por perto. Significa ser a empresa que a Inteligencia Artificial do Google recomenda quando um decisor pergunta: <em>&quot;Qual a empresa mais confiavel para icamento critico no porto de Itajai?&quot;</em>
        </p>
        <p className={`${styles.rodaText} ${styles.rodaPrimaryStrong} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.mapa_p5 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_p5">
          A SD Guindastes tem o historico operacional para nao apenas alcancar quem esta a frente - mas se tornar a referencia que os outros precisam alcancar.
        </p>
      </section>

      <section id="dobra-metodo" className={styles.rodaSection}>
        <span className={`${styles.rodaPill} ${styles.rodaReveal} ${visibleIds.metodo_tag ? styles.rodaVisible : ""}`} data-reveal-id="metodo_tag">
          METODO R.O.D.A.
        </span>
        <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.metodo_h2 ? styles.rodaVisible : ""}`} data-reveal-id="metodo_h2">
          Tres alavancas simultaneas. <strong>Um efeito composto irreversivel.</strong>
        </h2>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.metodo_p ? styles.rodaVisible : ""}`} data-reveal-id="metodo_p">
          O Metodo R.O.D.A. nao e uma campanha. E uma arquitetura matematica de alavancagem de receita que opera sobre as unicas tres variaveis que movem o faturamento de qualquer empresa.
        </p>

        <div className={styles.rodaCards}>
          <article className={`${styles.rodaCard} ${styles.rodaReveal} ${visibleIds.card1 ? styles.rodaVisible : ""}`} data-reveal-id="card1">
            <div className={styles.rodaCardNum}>01</div>
            <div className={styles.rodaIcon}>?</div>
            <h3>Aquisicao</h3>
            <p>Sua operacao passa a ser encontrada, citada e recomendada pelos algoritmos e pelas IAs antes da concorrencia em toda a malha industrial de Itajai.</p>
            <div className={styles.rodaBadges}><span>[SEO LOCAL]</span><span>[AIO]</span></div>
          </article>

          <article className={`${styles.rodaCard} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.card2 ? styles.rodaVisible : ""}`} data-reveal-id="card2">
            <div className={styles.rodaCardNum}>02</div>
            <div className={styles.rodaIcon}>?</div>
            <h3>Frequencia</h3>
            <p>Estruturamos ciclos de recontratacao com industrias que ja conhecem seu nivel operacional, convertendo servicos pontuais em recorrencia de alto valor.</p>
          </article>

          <article className={`${styles.rodaCard} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.card3 ? styles.rodaVisible : ""}`} data-reveal-id="card3">
            <div className={styles.rodaCardNum}>03</div>
            <div className={styles.rodaIcon}>?</div>
            <h3>Ticket Medio</h3>
            <p>Substituimos o modelo de hora/maquina por pacotes de solucao logistica, ancorados na resolucao do risco operacional.</p>
          </article>
        </div>

        <div className={`${styles.rodaCounterWrap} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.counter ? styles.rodaVisible : ""}`} data-reveal-id="counter">
          <div className={styles.rodaCounter}>{counter.toFixed(1).replace(".", ",")}%</div>
          <div className={styles.rodaCounterSub}>de expansao de receita projetada</div>
          <div className={styles.rodaFormula}>1,2 x 1,2 x 1,2 = 1,728</div>
        </div>

        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.metodo_final ? styles.rodaVisible : ""}`} data-reveal-id="metodo_final">
          Sem ampliar a frota. Sem depender de indicacao. Apenas interceptando a demanda que ja existe na sua regiao.
        </p>
      </section>

      <section id="dobra-roadmap" className={`${styles.rodaSection} ${styles.rodaRoadmapBg}`}>
        <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.road_h2 ? styles.rodaVisible : ""}`} data-reveal-id="road_h2">
          Implementacao em fases. <strong>Zero improviso.</strong>
        </h2>
        <p className={`${styles.rodaSubtitle} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.road_sub ? styles.rodaVisible : ""}`} data-reveal-id="road_sub">
          Cada etapa tem escopo definido, entregaveis auditaveis e responsabilidades documentadas.
        </p>

        <div className={styles.rodaTimeline}>
          <div className={styles.rodaTimelineLine} />

          <article className={`${styles.rodaTimelineCard} ${styles.rodaReveal} ${visibleIds.road_1 ? styles.rodaVisible : ""}`} data-reveal-id="road_1">
            <span className={styles.rodaPhase}>FASE 1</span>
            <h3>Dominio Organico B2B</h3>
            <h4>SEO Local + AIO</h4>
            <p>Reconstrucao tecnica do Google Business Profile e estruturacao semantica dos dados para que mapas locais e IAs reconhecam a SD como autoridade em icamento critico na regiao.</p>
          </article>

          <article className={`${styles.rodaTimelineCard} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.road_2 ? styles.rodaVisible : ""}`} data-reveal-id="road_2">
            <span className={styles.rodaPhase}>FASE 2</span>
            <h3>Infraestrutura de Conversao</h3>
            <h4>Landing Pages + Telemetria</h4>
            <p>Construcao de ambientes de proposta rastreaveis por tipo de servico. Voce sabera quando um gerente de compras abrir sua proposta e em qual bloco tomara a decisao.</p>
            <small>* Exatamente como o comportamento de leitura desta pagina e registrado agora.</small>
          </article>

          <article className={`${styles.rodaTimelineCard} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.road_3 ? styles.rodaVisible : ""}`} data-reveal-id="road_3">
            <span className={styles.rodaPhase}>FASE 3</span>
            <h3>Qualificacao de Pipeline</h3>
            <h4>Filtros MEDDIC</h4>
            <p>Implementacao de filtros para garantir que o tempo operacional da SD seja mobilizado apenas para industrias com orcamento real, decisor mapeado e processo ativo.</p>
          </article>
        </div>
      </section>

      <section id="dobra-cta" className={`${styles.rodaSection} ${styles.rodaCtaBg}`}>
        <div className={styles.rodaCtaInner}>
          <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.cta_h2 ? styles.rodaVisible : ""}`} data-reveal-id="cta_h2">
            A cada busca industrial em Itajai sem a SD Guindastes no topo, <strong>um contrato de alto ticket parte para outro patio.</strong>
          </h2>
          <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.cta_p1 ? styles.rodaVisible : ""}`} data-reveal-id="cta_p1">
            O Metodo R.O.D.A. nao e uma aposta. E uma implementacao tecnica de posicionamento de dados com escopo fechado e resultado auditavel.
          </p>
          <p className={`${styles.rodaText} ${styles.rodaPrimaryStrong} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.cta_p2 ? styles.rodaVisible : ""}`} data-reveal-id="cta_p2">
            O diagnostico da Fase 1 ja foi realizado com base nos dados publicos da sua operacao e do mercado regional de Itajai.
          </p>
          <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.cta_p3 ? styles.rodaVisible : ""}`} data-reveal-id="cta_p3">
            A execucao comeca quando voce confirmar abaixo.
          </p>

          <a
            href={CTA_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.rodaCtaButton}
            onClick={onCtaClick}
          >
            QUERO IMPLEMENTAR
          </a>
          <p className={styles.rodaCtaHint}>Voce sera direcionado para o WhatsApp. Sem formularios, sem intermediarios.</p>
        </div>
      </section>
    </main>
  );
}
