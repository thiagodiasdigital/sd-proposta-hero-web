"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import styles from "./ProposalSections.module.css";

const SEARCH_QUERY = "aluguel de munck Itajaí";
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
  const [demandCounter, setDemandCounter] = useState(0);

  const sessionStartRef = useRef<number>(0);
  const seenFoldsRef = useRef<Set<string>>(new Set());
  const seenDepthRef = useRef<Set<number>>(new Set());
  const currentFoldRef = useRef<string | null>(null);
  const currentFoldStartRef = useRef<number>(0);
  const counterStartedRef = useRef(false);
  const demandCounterStartedRef = useRef(false);

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

        if (foldId === "dobra-demanda-real" && !demandCounterStartedRef.current) {
          demandCounterStartedRef.current = true;
          const start = performance.now();
          const duration = 1400;
          const animate = (ts: number) => {
            const t = Math.min(1, (ts - start) / duration);
            const eased = 1 - (1 - t) ** 3;
            setDemandCounter(2.5 * eased);
            if (t < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
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
    const text = `Olá, quero implementar o Método R.O.D.A. na SD Guindastes. Sessão: ${sessionSeconds}s. Telemetria: ${payload}`;
    const targetUrl = `${CTA_BASE}?text=${encodeURIComponent(text)}`;

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className={styles.rodaRoot}>
      <section id="dobra-decisao" className={styles.rodaSection}>
        <div className={`${styles.rodaGrid} ${styles.rodaReveal} ${visibleIds.decisao_grid ? styles.rodaVisible : ""}`} data-reveal-id="decisao_grid">
          <article className={styles.rodaPanel}>
            <div className={styles.rodaSearchBar}>{typed}<span className={styles.rodaCaret}>|</span></div>
            <div className={styles.rodaResult}>#1 ALC Guindastes e Transportes</div>
            <div className={styles.rodaResult}>#2 Cilesio</div>
            <div className={styles.rodaResult}>#3 munck em itajai (Lima Munck)</div>
            <div className={styles.rodaMissing}>Sua empresa deveria estar aqui.</div>
          </article>

          <article className={styles.rodaPanel}>
            <div className={styles.rodaChatPrompt}>Qual empresa de içamento industrial eu contrato em Itajaí?</div>
            <div className={styles.rodaChatAnswer}>
              1) ALC Guindastes e Transportes
              <br />
              2) Cilesio
              <br />
              3) munck em itajai (Lima Munck)
            </div>
          </article>
        </div>

        <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.decisao_h2 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_h2">
          A decisão de contratar começa <strong>antes</strong> do seu telefone tocar.
        </h2>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.decisao_p1 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p1">
          Quando um engenheiro de obras, gerente de logística portuária ou responsável por montagem industrial em Itajaí precisa de içamento com urgência, ele não abre o Instagram.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.decisao_p2 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p2">
          Ele busca no Google. Ou faz a pergunta direto para uma Inteligência Artificial.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.decisao_p3 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p3">
          Em menos de três segundos, a decisão já começa. Quem aparece no topo do mapa e quem é recomendado pela IA recebe o contato. Quem aparece depois disputa o que sobrou.
        </p>
        <p className={`${styles.rodaHighlight} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.decisao_p4 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p4">
          As empresas que hoje ocupam esses resultados não chegaram lá por ter o melhor equipamento. Chegaram porque trataram o posicionamento digital como infraestrutura operacional - do mesmo jeito que tratam a manutenção da frota.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaBold} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.decisao_p5 ? styles.rodaVisible : ""}`} data-reveal-id="decisao_p5">
          A SD Guindastes tem a frota e a operação. Falta a engenharia de dados que traduz essa capacidade para os algoritmos modernos.
        </p>
      </section>

      <section id="dobra-demanda-real" className={styles.rodaSection}>
        <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.dem_h2 ? styles.rodaVisible : ""}`} data-reveal-id="dem_h2">
          O mercado industrial do Litoral opera em alta rotação. <strong>Seu maquinário também deveria.</strong>
        </h2>

        <div className={styles.rodaDemandGrid}>
          <article className={`${styles.rodaDemandLeft} ${styles.rodaReveal} ${visibleIds.dem_left ? styles.rodaVisible : ""}`} data-reveal-id="dem_left">
            <h3>A Demanda Estrutural Oculta</h3>
            <div className={styles.rodaDemandCounter}>
              <span>{demandCounter.toFixed(1).replace(".", ",")}</span> milhões
            </div>
            <p>
              O complexo portuário de Itajaí e a explosão de construção civil em Balneário Camboriú, Itapema e Camboriú geram uma demanda ininterrupta por engenharia de içamento.
            </p>

            <ul className={styles.rodaDemandList}>
              <li><i className={styles.rodaCheck} />Balneário Camboriú</li>
              <li><i className={styles.rodaCheck} />Itapema</li>
              <li><i className={styles.rodaCheck} />Camboriú</li>
              <li><i className={styles.rodaCheck} />Porto de Itajaí</li>
            </ul>

            <ul className={styles.rodaDemandList}>
              <li><i className={styles.rodaCheck} />Transporte de contêineres e remoção industrial;</li>
              <li><i className={styles.rodaCheck} />Montagem de galpões logísticos e estruturas pré-moldadas;</li>
              <li><i className={styles.rodaCheck} />Içamento de peças náuticas e câmaras frias.</li>
            </ul>

            <p className={styles.rodaHighlight}>
              Todos os dias, dezenas de tomadores de decisão dessas cidades procuram no Google por empresas preparadas para serviços de alto risco.
            </p>
          </article>

          <article className={`${styles.rodaDemandRight} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.dem_right ? styles.rodaVisible : ""}`} data-reveal-id="dem_right">
            <div className={styles.rodaIdleIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <path d="M3 6h12v2H3zM15 7h4v2h-2v6h-2zM8 8h2v8h-2zM10 16h8v2h-8zM18 18a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </div>
            <h3>O Custo Silencioso do Pátio</h3>
            <p>
              Sua empresa investiu capital pesado em infraestrutura. Vocês possuem caminhões munck robustos, cestos aéreos de precisão e garfos paleteiros.
            </p>
            <p>
              Mas o ativo mais caro de uma operação de transporte não é a manutenção do caminhão. <strong>É a hora/máquina ociosa.</strong>
            </p>
            <p>
              Quando o seu posicionamento digital foca apenas no bairro ou em buscas orgânicas de baixo volume, o seu cesto aéreo fica no pátio enquanto a obra vizinha contrata um equipamento igual ao seu, de uma empresa que estava melhor posicionada no Google.
            </p>
          </article>
        </div>

        <p className={`${styles.rodaText} ${styles.rodaDemandFinal} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.dem_final ? styles.rodaVisible : ""}`} data-reveal-id="dem_final">
          Não se trata de apontar falhas na sua operação. A SD Guindastes tem a frota que muitas dessas construtoras precisam para ontem. Trata-se de reconhecer que o capital está fluindo, mas o algoritmo de busca não está conectando o seu pátio ao problema do cliente.
        </p>
      </section>

      <section id="dobra-mapa" className={`${styles.rodaSection} ${styles.rodaMapBg}`}>
        <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.mapa_h2 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_h2">
          O espaço existe. A demanda já está lá. <strong>Falta o posicionamento.</strong>
        </h2>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.mapa_p1 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_p1">
          O mercado de içamento industrial, montagem de galpões e locação de munck em Itajaí tem demanda real, crescente e subestimada digitalmente.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.mapa_p2 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_p2">
          Empresas que hoje estão à frente capturaram as primeiras posições por ausência de concorrência técnica. Não por superioridade de equipamento. Não por preço menor. Não por mais anos de mercado.
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
                <span>ALC Guindastes e Transportes</span>
              </div>
              <div className={`${styles.rodaPoint} ${styles.rodaCompetitor}`} style={{ left: "66%", top: "24%" }}>
                <span>Cilesio</span>
              </div>
              <div className={`${styles.rodaPoint} ${styles.rodaCompetitor}`} style={{ left: "74%", top: "69%" }}>
                <span>munck em itajai (Lima Munck)</span>
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
          Há uma lacuna no posicionamento delas: estão otimizadas para o Google de ontem. A janela que se abre agora é o SEO Local avançado cruzado com AIO - Artificial Intelligence Optimization.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.mapa_p4 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_p4">
          Isso significa não apenas aparecer no mapa quando alguém busca por perto. Significa ser a empresa que a Inteligência Artificial do Google recomenda quando um decisor pergunta: <em>&quot;Qual a empresa mais confiável para içamento crítico no porto de Itajaí?&quot;</em>
        </p>
        <p className={`${styles.rodaText} ${styles.rodaPrimaryStrong} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.mapa_p5 ? styles.rodaVisible : ""}`} data-reveal-id="mapa_p5">
          A SD Guindastes tem o histórico operacional para não apenas alcançar quem está à frente - mas se tornar a referência que os outros precisam alcançar.
        </p>
      </section>

      <section id="dobra-ecossistema" className={styles.rodaSection}>
        <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.eco_h2 ? styles.rodaVisible : ""}`} data-reveal-id="eco_h2">
          O erro do mercado é procurar o <strong>&quot;Botão Mágico&quot;.</strong> Ele não existe.
        </h2>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.eco_p1 ? styles.rodaVisible : ""}`} data-reveal-id="eco_p1">
          O mercado de marketing industrial convencionou vender soluções isoladas. Eles tentam convencer você de que a solução para a sua empresa é &quot;apenas&quot; produzir mais vídeos no Instagram, ou &quot;apenas&quot; comprar anúncios, ou &quot;apenas&quot; ter um site novo.
        </p>
        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.eco_p2 ? styles.rodaVisible : ""}`} data-reveal-id="eco_p2">
          A verdade operacional é fria: não existe uma única ferramenta capaz de sustentar uma operação corporativa.
        </p>

        <div
          className={`${styles.rodaEcoWrap} ${visibleIds.eco_diagram ? styles.rodaEcoWrapActive : ""} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.eco_diagram ? styles.rodaVisible : ""}`}
          data-reveal-id="eco_diagram"
        >
          <div className={styles.rodaIslandGrid}>
            <div className={styles.rodaIsland}>Redes Sociais (Instagram/LinkedIn)</div>
            <div className={styles.rodaIsland}>Google (Busca e Mapas)</div>
            <div className={styles.rodaIsland}>Sites e Diretorios</div>
            <div className={styles.rodaIsland}>Trafego Pago</div>
          </div>

          <div className={styles.rodaCenterGear}>Ecossistema Sincronizado</div>

          <span className={`${styles.rodaConnector} ${styles.rodaConnector1} ${visibleIds.eco_diagram ? styles.rodaEcoActive : ""}`} />
          <span className={`${styles.rodaConnector} ${styles.rodaConnector2} ${visibleIds.eco_diagram ? styles.rodaEcoActive : ""}`} />
          <span className={`${styles.rodaConnector} ${styles.rodaConnector3} ${visibleIds.eco_diagram ? styles.rodaEcoActive : ""}`} />
          <span className={`${styles.rodaConnector} ${styles.rodaConnector4} ${visibleIds.eco_diagram ? styles.rodaEcoActive : ""}`} />
        </div>

        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.eco_p3 ? styles.rodaVisible : ""}`} data-reveal-id="eco_p3">
          Redes sociais servem para prova de capacidade técnica (como os vídeos da SD descarregando câmara fria). O Google (SEO/GBP/AIO) serve para interceptar a demanda ativa de quem já tem o problema. Tráfego pago serve para acelerar regiões específicas. O site serve para blindar o preço e gerar conversão rastreável.
        </p>
        <p className={`${styles.rodaHighlight} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.eco_p4 ? styles.rodaVisible : ""}`} data-reveal-id="eco_p4">
          O jogo não se ganha escolhendo entre tráfego orgânico ou pago, entre Instagram ou Google. O jogo se ganha usando a ferramenta certa, no momento exato do ciclo de decisão do cliente corporativo.
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
          O Método R.O.D.A. não é uma campanha. É uma arquitetura matemática de alavancagem de receita que opera sobre as únicas três variáveis que movem o faturamento de qualquer empresa.
        </p>

        <div className={styles.rodaCards}>
          <article className={`${styles.rodaCard} ${styles.rodaReveal} ${visibleIds.card1 ? styles.rodaVisible : ""}`} data-reveal-id="card1">
            <div className={styles.rodaCardNum}>01</div>
            <div className={styles.rodaIcon}>?</div>
            <h3>Aquisição</h3>
            <p>Sua operação passa a ser encontrada, citada e recomendada pelos algoritmos e pelas IAs antes da concorrência em toda a malha industrial de Itajaí.</p>
            <div className={styles.rodaBadges}><span>[SEO LOCAL]</span><span>[AIO]</span></div>
          </article>

          <article className={`${styles.rodaCard} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.card2 ? styles.rodaVisible : ""}`} data-reveal-id="card2">
            <div className={styles.rodaCardNum}>02</div>
            <div className={styles.rodaIcon}>?</div>
            <h3>Frequência</h3>
            <p>Estruturamos ciclos de recontratação com indústrias que já conhecem seu nível operacional, convertendo serviços pontuais em recorrência de alto valor.</p>
          </article>

          <article className={`${styles.rodaCard} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.card3 ? styles.rodaVisible : ""}`} data-reveal-id="card3">
            <div className={styles.rodaCardNum}>03</div>
            <div className={styles.rodaIcon}>?</div>
            <h3>Ticket Médio</h3>
            <p>Substituímos o modelo de hora/máquina por pacotes de solução logística, ancorados na resolução do risco operacional.</p>
          </article>
        </div>

        <div className={`${styles.rodaCounterWrap} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.counter ? styles.rodaVisible : ""}`} data-reveal-id="counter">
          <div className={styles.rodaCounter}>{counter.toFixed(1).replace(".", ",")}%</div>
          <div className={styles.rodaCounterSub}>de expansão de receita projetada</div>
          <div className={styles.rodaFormula}>1,2 x 1,2 x 1,2 = 1,728</div>
        </div>

        <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay3} ${visibleIds.metodo_final ? styles.rodaVisible : ""}`} data-reveal-id="metodo_final">
          Sem ampliar a frota. Sem depender de indicação. Apenas interceptando a demanda que já existe na sua região.
        </p>
      </section>

      <section id="dobra-roadmap" className={`${styles.rodaSection} ${styles.rodaRoadmapBg}`}>
        <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.road_h2 ? styles.rodaVisible : ""}`} data-reveal-id="road_h2">
          Implementação em fases. <strong>Zero improviso.</strong>
        </h2>
        <p className={`${styles.rodaSubtitle} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.road_sub ? styles.rodaVisible : ""}`} data-reveal-id="road_sub">
          Cada etapa tem escopo definido, entregáveis auditáveis e responsabilidades documentadas.
        </p>

        <div className={styles.rodaTimeline}>
          <div className={styles.rodaTimelineLine} />

          <article className={`${styles.rodaTimelineCard} ${styles.rodaReveal} ${visibleIds.road_1 ? styles.rodaVisible : ""}`} data-reveal-id="road_1">
            <span className={styles.rodaPhase}>FASE 1</span>
            <h3>Domínio Orgânico B2B</h3>
            <h4>SEO Local + AIO</h4>
            <p>Reconstrução técnica do Google Business Profile e estruturação semântica dos dados para que mapas locais e IAs reconheçam a SD como autoridade em içamento crítico na região.</p>
          </article>

          <article className={`${styles.rodaTimelineCard} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.road_2 ? styles.rodaVisible : ""}`} data-reveal-id="road_2">
            <span className={styles.rodaPhase}>FASE 2</span>
            <h3>Infraestrutura de Conversão</h3>
            <h4>Landing Pages + Telemetria</h4>
            <p>Construção de ambientes de proposta rastreáveis por tipo de serviço. Você saberá quando um gerente de compras abrir sua proposta e em qual bloco tomará a decisão.</p>
            <small>* Exatamente como o comportamento de leitura desta página é registrado agora.</small>
          </article>

          <article className={`${styles.rodaTimelineCard} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.road_3 ? styles.rodaVisible : ""}`} data-reveal-id="road_3">
            <span className={styles.rodaPhase}>FASE 3</span>
            <h3>Qualificação de Pipeline</h3>
            <h4>Filtros MEDDIC</h4>
            <p>Implementação de filtros para garantir que o tempo operacional da SD seja mobilizado apenas para indústrias com orçamento real, decisor mapeado e processo ativo.</p>
          </article>
        </div>
      </section>

      <section id="dobra-cta" className={`${styles.rodaSection} ${styles.rodaCtaBg}`}>
        <div className={styles.rodaCtaInner}>
          <h2 className={`${styles.rodaTitle} ${styles.rodaReveal} ${visibleIds.cta_h2 ? styles.rodaVisible : ""}`} data-reveal-id="cta_h2">
            A cada busca industrial em Itajaí sem a SD Guindastes no topo, <strong>um contrato de alto ticket parte para outro pátio.</strong>
          </h2>
          <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.cta_p1 ? styles.rodaVisible : ""}`} data-reveal-id="cta_p1">
            O Método R.O.D.A. não é uma aposta. É uma implementação técnica de posicionamento de dados com escopo fechado e resultado auditável.
          </p>
          <p className={`${styles.rodaText} ${styles.rodaPrimaryStrong} ${styles.rodaReveal} ${styles.rodaDelay1} ${visibleIds.cta_p2 ? styles.rodaVisible : ""}`} data-reveal-id="cta_p2">
            O diagnóstico da Fase 1 já foi realizado com base nos dados públicos da sua operação e do mercado regional de Itajaí.
          </p>
          <p className={`${styles.rodaText} ${styles.rodaReveal} ${styles.rodaDelay2} ${visibleIds.cta_p3 ? styles.rodaVisible : ""}`} data-reveal-id="cta_p3">
            A execução começa quando você confirmar abaixo.
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
          <p className={styles.rodaCtaHint}>Você será direcionado para o WhatsApp. Sem formulários, sem intermediários.</p>
        </div>
      </section>
    </main>
  );
}
