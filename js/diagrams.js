/* ============================================
   AI ACADEMY DIAGRAM ENGINE
   Interactive SVG visualisations for AI concepts.

   Same public API as the Azure Networking Academy engine:
     DiagramEngine.render(diagrams)     // diagrams = array on a module
     DiagramEngine.cleanup()
     DiagramEngine.play(id) / reset(id) / stepThrough(id)

   Each diagram object: { id, type, title, description?, steps?, legend? }
   builders[type] returns the SVG markup.
   ============================================ */

const DiagramEngine = {

    activeAnimations: [],

    // ── Standard arrowhead markers ──
    arrowDefs(colors) {
        return colors.map(c => {
            const id = c.replace('#', '');
            return `<marker id="ah-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L10,5 L0,9 Z" fill="${c}"/></marker>`;
        }).join('\n');
    },

    // ── Render API ──
    render(diagrams) {
        const container = document.getElementById('tab-diagrams');
        if (!container) return;
        if (!diagrams || diagrams.length === 0) {
            container.innerHTML = '<p class="no-content">No visual diagrams for this module yet.</p>';
            return;
        }
        container.innerHTML = `<div class="diagrams-wrapper">${diagrams.map(d => this.renderDiagram(d)).join('')}</div>`;
        // Synchronous init — rAF is throttled indefinitely in hidden/background tabs
        diagrams.forEach(d => this.initDiagram(d));
    },

    cleanup() {
        this.activeAnimations.forEach(id => cancelAnimationFrame(id));
        this.activeAnimations = [];
    },

    renderDiagram(diagram) {
        return `
        <div class="visual-diagram" id="diagram-${diagram.id}">
            <div class="diagram-title-bar">
                <h3>${diagram.title}</h3>
                <div class="diagram-controls">
                    ${diagram.steps ? `<button class="diag-btn diag-btn-step" onclick="DiagramEngine.stepThrough('${diagram.id}')">▶ Step</button>` : ''}
                    <button class="diag-btn diag-btn-play" onclick="DiagramEngine.play('${diagram.id}')">▶ Play</button>
                    <button class="diag-btn diag-btn-reset" onclick="DiagramEngine.reset('${diagram.id}')">↺ Reset</button>
                </div>
            </div>
            ${diagram.description ? `<p class="diagram-description">${diagram.description}</p>` : ''}
            <div class="diagram-canvas" id="canvas-${diagram.id}"></div>
            ${diagram.steps ? `
            <div class="diagram-step-info" id="stepinfo-${diagram.id}">
                <div class="step-counter">Step <span id="stepcnt-${diagram.id}">0</span> / ${diagram.steps.length}</div>
                <div class="step-text" id="steptxt-${diagram.id}">Click "Step" to begin</div>
            </div>` : ''}
            ${diagram.legend ? `<div class="diagram-legend">${diagram.legend.map(l => `<span class="legend-item"><span class="legend-dot" style="background:${l.color}"></span>${l.label}</span>`).join('')}</div>` : ''}
        </div>`;
    },

    initDiagram(diagram) {
        const canvas = document.getElementById(`canvas-${diagram.id}`);
        if (!canvas) return;
        canvas.dataset.step = '0';
        canvas.dataset.playing = 'false';
        const builder = this.builders[diagram.type] || this.builders._fallback;
        canvas.innerHTML = builder.call(this, diagram);
    },

    play(diagramId) {
        const canvas = document.getElementById(`canvas-${diagramId}`);
        if (!canvas) return;
        canvas.dataset.playing = 'true';
        canvas.classList.add('animating');
        const svg = canvas.querySelector('svg');
        if (svg) { svg.classList.remove('animate-all'); void svg.offsetWidth; svg.classList.add('animate-all'); }
    },

    reset(diagramId) {
        const canvas = document.getElementById(`canvas-${diagramId}`);
        if (!canvas) return;
        canvas.dataset.step = '0';
        canvas.dataset.playing = 'false';
        canvas.classList.remove('animating');
        const svg = canvas.querySelector('svg');
        if (svg) {
            svg.classList.remove('animate-all');
            svg.querySelectorAll('.step-highlight').forEach(el => el.classList.remove('active'));
        }
        const stepTxt = document.getElementById(`steptxt-${diagramId}`);
        const stepCnt = document.getElementById(`stepcnt-${diagramId}`);
        if (stepTxt) stepTxt.textContent = 'Click "Step" to begin';
        if (stepCnt) stepCnt.textContent = '0';
    },

    stepThrough(diagramId) {
        const canvas = document.getElementById(`canvas-${diagramId}`);
        if (!canvas) return;
        const allMods = (typeof MODULES !== 'undefined') ? MODULES : [];
        let diagram = null;
        for (const m of allMods) {
            if (m.diagrams) {
                const d = m.diagrams.find(x => x.id === diagramId);
                if (d) { diagram = d; break; }
            }
        }
        if (!diagram || !diagram.steps) return;

        let step = parseInt(canvas.dataset.step, 10) || 0;
        step = (step + 1) % (diagram.steps.length + 1);
        canvas.dataset.step = step;

        const svg = canvas.querySelector('svg');
        if (svg) {
            svg.querySelectorAll('.step-highlight').forEach(el => el.classList.remove('active'));
            if (step > 0) {
                svg.querySelectorAll(`[data-step="${step}"]`).forEach(el => el.classList.add('active'));
            }
        }
        const stepTxt = document.getElementById(`steptxt-${diagramId}`);
        const stepCnt = document.getElementById(`stepcnt-${diagramId}`);
        if (stepCnt) stepCnt.textContent = step;
        if (stepTxt) stepTxt.textContent = step === 0 ? 'Click "Step" to begin' : diagram.steps[step - 1];
    },

    // ──────────────────────────────────────────────
    // BUILDER-TRACK HELPERS (ported from ai-builder-academy,
    // light-theme palette). Used by the b-* builders below.
    // ──────────────────────────────────────────────
    BC: {
        purple: '#7c3aed', blue: '#0ea5e9', green: '#059669', amber: '#d97706',
        red: '#dc2626', text: '#1f2937', sub: '#6b7280',
        node: '#ffffff', nodeBorder: '#d1d5db'
    },

    bArrow(color) {
        const id = 'ah-' + color.replace('#', '');
        return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L10,5 L0,9 Z" fill="${color}"/></marker>`;
    },

    bNode(n, fallback) {
        const c = n.color || fallback;
        const lines = (n.sub || '').split('\n');
        return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="10"
                 fill="${this.BC.node}" stroke="${c}" stroke-width="2"/>
            ${n.icon ? `<text x="${n.x + n.w / 2}" y="${n.y + 24}" text-anchor="middle" font-size="18">${n.icon}</text>` : ''}
            <text x="${n.x + n.w / 2}" y="${n.y + (n.icon ? 44 : 24)}" text-anchor="middle" fill="${this.BC.text}" font-size="13" font-weight="700">${n.label}</text>
            ${lines.map((s, i) => `<text x="${n.x + n.w / 2}" y="${n.y + (n.icon ? 60 : 40) + i * 14}" text-anchor="middle" fill="${this.BC.sub}" font-size="10.5">${s}</text>`).join('')}`;
    },

    bEdgePath(a, b) {
        const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
        if (Math.abs(ac.y - bc.y) < 10) {
            const x1 = ac.x < bc.x ? a.x + a.w : a.x, x2 = ac.x < bc.x ? b.x : b.x + b.w;
            return `M ${x1} ${ac.y} L ${x2} ${bc.y}`;
        }
        if (Math.abs(ac.x - bc.x) < 10) {
            const y1 = ac.y < bc.y ? a.y + a.h : a.y, y2 = ac.y < bc.y ? b.y : b.y + b.h;
            return `M ${ac.x} ${y1} L ${bc.x} ${y2}`;
        }
        const x1 = ac.x < bc.x ? a.x + a.w : a.x;
        const y2 = ac.y < bc.y ? b.y : b.y + b.h;
        return `M ${x1} ${ac.y} L ${bc.x} ${ac.y} L ${bc.x} ${y2}`;
    },

    // ──────────────────────────────────────────────
    // BUILDERS — one per diagram type
    // ──────────────────────────────────────────────
    builders: {

        /* ── Builder Track (b-*): config-driven, data in modules-builder.js ── */

        'b-pipeline'(d) {
            const { nodes, edges, viewBox = '0 0 860 420' } = d.data;
            const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
            const colors = [...new Set(edges.map(e => e.color || this.BC.purple))];
            const edgeSvg = edges.map(e => {
                const p = this.bEdgePath(byId[e.from], byId[e.to]);
                const c = e.color || this.BC.purple;
                return `<g ${e.step ? `data-step="${e.step}" class="step-highlight"` : ''}>
                    <path d="${p}" fill="none" stroke="${c}" stroke-width="2" ${e.dashed ? 'stroke-dasharray="6 5"' : ''} marker-end="url(#ah-${c.replace('#','')})"/>
                    ${e.label ? `<text x="${(byId[e.from].x + byId[e.from].w / 2 + byId[e.to].x + byId[e.to].w / 2) / 2}" y="${(byId[e.from].y + byId[e.from].h / 2 + byId[e.to].y + byId[e.to].h / 2) / 2 - 8}" text-anchor="middle" fill="${this.BC.sub}" font-size="10.5" font-style="italic">${e.label}</text>` : ''}
                    ${e.dot !== false ? `<circle r="4.5" fill="${c}" class="flow-dot"><animateMotion dur="${e.dur || 2.2}s" repeatCount="indefinite" path="${p}"/></circle>` : ''}
                </g>`;
            }).join('');
            const nodeSvg = nodes.map(n =>
                `<g ${n.step ? `data-step="${n.step}" class="step-highlight"` : ''}>${this.bNode(n, this.BC.purple)}</g>`).join('');
            return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">
                <defs>${colors.map(c => this.bArrow(c)).join('')}</defs>${edgeSvg}${nodeSvg}</svg>`;
        },

        'b-layers'(d) {
            const { layers, viewBox = '0 0 860 400' } = d.data;
            const w = 640, x = 110, h = Math.min(58, 320 / layers.length - 10);
            const rows = layers.map((l, i) => {
                const y = 40 + i * (h + 14);
                return `<g ${l.step ? `data-step="${l.step}" class="step-highlight"` : ''}>
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${this.BC.node}" stroke="${l.color}" stroke-width="2"/>
                    <text x="${x + 18}" y="${y + h / 2 - 4}" fill="${this.BC.text}" font-size="13.5" font-weight="700">${l.label}</text>
                    <text x="${x + 18}" y="${y + h / 2 + 14}" fill="${this.BC.sub}" font-size="11">${l.sub || ''}</text>
                    ${l.tag ? `<text x="${x + w - 16}" y="${y + h / 2 + 5}" text-anchor="end" fill="${l.color}" font-size="11.5" font-weight="700">${l.tag}</text>` : ''}
                </g>
                ${i < layers.length - 1 ? `<line x1="${x + w / 2}" y1="${y + h}" x2="${x + w / 2}" y2="${y + h + 14}" stroke="${this.BC.nodeBorder}" stroke-width="2"/>` : ''}`;
            }).join('');
            return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${rows}</svg>`;
        },

        'b-bars'(d) {
            const { bars, series, viewBox = '0 0 860 420' } = d.data;
            const x0 = 250, wMax = 480, rowH = series ? 52 : 42;
            const rows = bars.map((b, i) => {
                const y = 70 + i * rowH;
                const w1 = b.value * wMax;
                let out = `<g ${b.step ? `data-step="${b.step}" class="step-highlight"` : ''}>
                    <text x="${x0 - 14}" y="${y + 15}" text-anchor="end" fill="${this.BC.text}" font-size="12.5" font-weight="600">${b.label}</text>
                    <rect x="${x0}" y="${y}" width="${wMax}" height="18" rx="4" fill="#eef0f4"/>
                    <rect x="${x0}" y="${y}" width="${w1}" height="18" rx="4" fill="${b.color || this.BC.purple}" class="bar-fill"/>
                    <text x="${x0 + w1 + 10}" y="${y + 14}" fill="${b.color || this.BC.purple}" font-size="12" font-weight="700">${b.display}</text>`;
                if (series && b.value2 !== undefined) {
                    const w2 = b.value2 * wMax;
                    out += `<rect x="${x0}" y="${y + 22}" width="${wMax}" height="18" rx="4" fill="#eef0f4"/>
                    <rect x="${x0}" y="${y + 22}" width="${w2}" height="18" rx="4" fill="${b.color2 || this.BC.blue}" class="bar-fill"/>
                    <text x="${x0 + w2 + 10}" y="${y + 36}" fill="${b.color2 || this.BC.blue}" font-size="12" font-weight="700">${b.display2}</text>`;
                }
                return out + '</g>';
            }).join('');
            const legend = series ? `
                <rect x="${x0}" y="30" width="14" height="14" rx="3" fill="${this.BC.purple}"/><text x="${x0 + 20}" y="42" fill="${this.BC.sub}" font-size="12">${series[0]}</text>
                <rect x="${x0 + 130}" y="30" width="14" height="14" rx="3" fill="${this.BC.blue}"/><text x="${x0 + 150}" y="42" fill="${this.BC.sub}" font-size="12">${series[1]}</text>` : '';
            return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${legend}${rows}</svg>`;
        },

        'b-curves'(d) {
            const { curves, xLabel, yLabel, viewBox = '0 0 860 420' } = d.data;
            const ox = 90, oy = 340, w = 660, h = 260;
            const toX = v => ox + v * w, toY = v => oy - v * h;
            const paths = curves.map(c => {
                const pts = c.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p[0])} ${toY(p[1])}`).join(' ');
                const last = c.points[c.points.length - 1];
                return `<g ${c.step ? `data-step="${c.step}" class="step-highlight"` : ''}>
                    <path d="${pts}" fill="none" stroke="${c.color}" stroke-width="2.5" class="curve-path"/>
                    <text x="${toX(last[0]) + 8}" y="${toY(last[1]) + 4}" fill="${c.color}" font-size="12" font-weight="700">${c.label}</text>
                </g>`;
            }).join('');
            return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">
                <line x1="${ox}" y1="${oy}" x2="${ox + w}" y2="${oy}" stroke="${this.BC.nodeBorder}" stroke-width="2"/>
                <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy - h}" stroke="${this.BC.nodeBorder}" stroke-width="2"/>
                <text x="${ox + w / 2}" y="${oy + 34}" text-anchor="middle" fill="${this.BC.sub}" font-size="12">${xLabel}</text>
                <text x="${ox - 40}" y="${oy - h / 2}" text-anchor="middle" fill="${this.BC.sub}" font-size="12" transform="rotate(-90 ${ox - 40} ${oy - h / 2})">${yLabel}</text>
                ${paths}</svg>`;
        },

        'b-graph'(d) {
            const { nodes, links, viewBox = '0 0 860 440' } = d.data;
            const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
            const linkSvg = links.map(l => {
                const a = byId[l.from], b = byId[l.to];
                return `<g ${l.step ? `data-step="${l.step}" class="step-highlight"` : ''}>
                    <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${l.hop ? this.BC.amber : this.BC.nodeBorder}" stroke-width="${l.hop ? 3 : 1.5}" class="${l.hop ? 'hop-edge' : ''}"/>
                    <text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 6}" text-anchor="middle" fill="${l.hop ? this.BC.amber : this.BC.sub}" font-size="9.5" font-style="italic">${l.label}</text>
                </g>`;
            }).join('');
            const nodeSvg = nodes.map(n => `
                <g ${n.step ? `data-step="${n.step}" class="step-highlight"` : ''}>
                    <circle cx="${n.x}" cy="${n.y}" r="26" fill="${this.BC.node}" stroke="${n.color}" stroke-width="2.5" class="graph-node"/>
                    <text x="${n.x}" y="${n.y - 2}" text-anchor="middle" fill="${this.BC.text}" font-size="10.5" font-weight="700">${n.label}</text>
                    <text x="${n.x}" y="${n.y + 11}" text-anchor="middle" fill="${n.color}" font-size="8.5">${n.type}</text>
                </g>`).join('');
            return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${linkSvg}${nodeSvg}</svg>`;
        },

        'b-timeline'(d) {
            const { events, viewBox = '0 0 860 480' } = d.data;
            const x = 150, rowH = Math.min(62, 420 / events.length);
            const rows = events.map((e, i) => {
                const y = 36 + i * rowH;
                return `<g ${e.step ? `data-step="${e.step}" class="step-highlight"` : ''}>
                    <circle cx="${x}" cy="${y}" r="7" fill="${e.color}" class="timeline-dot"/>
                    ${i < events.length - 1 ? `<line x1="${x}" y1="${y + 8}" x2="${x}" y2="${y + rowH - 8}" stroke="${this.BC.nodeBorder}" stroke-width="2"/>` : ''}
                    <text x="${x - 20}" y="${y + 4}" text-anchor="end" fill="${e.color}" font-size="11.5" font-weight="700" font-family="ui-monospace,Consolas,monospace">${e.kind}</text>
                    <rect x="${x + 22}" y="${y - 15}" width="600" height="32" rx="8" fill="${this.BC.node}" stroke="${this.BC.nodeBorder}"/>
                    <text x="${x + 36}" y="${y - 1}" fill="${this.BC.text}" font-size="11">${e.text}</text>
                    <text x="${x + 36}" y="${y + 12}" fill="${this.BC.sub}" font-size="9.5">actor: ${e.actor}</text>
                </g>`;
            }).join('');
            return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${rows}</svg>`;
        },

        // 1. The AI stack — concentric labelled boxes
        'ai-stack'(d) {
            // Each layer is 35px taller than the next inner one, so the
            // visible top band is exactly 35px. Label + italic example must
            // both fit inside that band, otherwise the inner box covers them.
            const layers = [
                { label: 'Artificial Intelligence',  example: 'e.g. chess engines, fraud detection, spam filters', w: 720, h: 380, color: '#ddd6fe', text: '#4c1d95', sub: '#5b21b6' },
                { label: 'Machine Learning',         example: 'e.g. Netflix recommendations, demand forecasting',  w: 600, h: 310, color: '#c4b5fd', text: '#4c1d95', sub: '#5b21b6' },
                { label: 'Deep Learning',            example: 'e.g. image recognition, speech-to-text',            w: 480, h: 240, color: '#a78bfa', text: '#1e1b4b', sub: '#312e81' },
                { label: 'Generative AI',            example: 'e.g. ChatGPT, Midjourney, Sora',                    w: 360, h: 170, color: '#8b5cf6', text: '#fff',    sub: '#ede9fe' },
                { label: 'Large Language Models',    example: 'GPT · Claude · Gemini',                              w: 240, h: 100, color: '#7c3aed', text: '#fff',    sub: '#ede9fe', innermost: true }
            ];
            const cx = 400, cy = 220;
            const boxes = layers.map((l, i) => {
                const top = cy - l.h / 2;
                // Outer layers: stack label+example inside the 35px visible top band.
                // Innermost layer: centre the label + example vertically (no inner box to dodge).
                const labelY = l.innermost ? cy - 4 : top + 14;
                const exY    = l.innermost ? cy + 14 : top + 27;
                const labelSize = l.innermost ? 14 : 13;
                const exSize    = l.innermost ? 12 : 10;
                return `<g data-step="${i + 1}" class="step-highlight ai-stack-layer">
                    <rect x="${cx - l.w / 2}" y="${top}" width="${l.w}" height="${l.h}" rx="10" fill="${l.color}" stroke="#4c1d95" stroke-width="1.5"/>
                    <text x="${cx}" y="${labelY}" text-anchor="middle" fill="${l.text}" font-size="${labelSize}" font-weight="700">${l.label}</text>
                    <text x="${cx}" y="${exY}" text-anchor="middle" fill="${l.sub}" font-size="${exSize}" font-style="italic">${l.example}</text>
                </g>`;
            }).join('');
            return `<svg viewBox="0 0 800 440" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed'])}</defs>
                ${boxes}
            </svg>`;
        },

        // 2. Tokenisation — text flowing into tokens
        'tokenisation'(d) {
            const text = '"The cat sat on the mat"';
            const tokens = ['"The', ' cat', ' sat', ' on', ' the', ' mat', '"'];
            const ids   = ['1820', '8415', '7423', '402', '1820', '17143', '1'];
            const startX = 80, tokenW = 80, gap = 8;
            const tokY = 200;

            const tokenGroups = tokens.map((t, i) => {
                const x = startX + i * (tokenW + gap);
                return `<g data-step="${i + 1}" class="step-highlight token-group">
                    <rect x="${x}" y="${tokY}" width="${tokenW}" height="48" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
                    <text x="${x + tokenW / 2}" y="${tokY + 20}" text-anchor="middle" fill="#4c1d95" font-size="13" font-family="ui-monospace,Consolas,monospace" font-weight="600">${t.replace(/ /g, '·')}</text>
                    <text x="${x + tokenW / 2}" y="${tokY + 38}" text-anchor="middle" fill="#7c3aed" font-size="10" font-family="ui-monospace,Consolas,monospace">id=${ids[i]}</text>
                </g>`;
            }).join('');

            return `<svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed'])}</defs>
                <text x="400" y="60" text-anchor="middle" fill="#4c1d95" font-size="22" font-weight="700">Input text</text>
                <rect x="180" y="80" width="440" height="60" rx="8" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
                <text x="400" y="118" text-anchor="middle" fill="#1f2937" font-size="20" font-family="ui-monospace,Consolas,monospace">${text}</text>
                <text x="400" y="170" text-anchor="middle" fill="#6b7280" font-size="13" font-style="italic">↓ tokeniser splits into sub-word tokens ↓</text>
                ${tokenGroups}
                <text x="400" y="290" text-anchor="middle" fill="#4c1d95" font-size="14">Each token is converted to a numeric ID. The model sees only IDs.</text>
                <text x="400" y="320" text-anchor="middle" fill="#6b7280" font-size="12">≈ 4 chars per token (English) · 100K-token vocab is typical</text>
            </svg>`;
        },

        // 3. Next-token prediction — top-k probability bars
        'next-token'(d) {
            const candidates = [
                { tok: 'sat',     p: 0.42 },
                { tok: 'jumped',  p: 0.18 },
                { tok: 'ran',     p: 0.12 },
                { tok: 'slept',   p: 0.08 },
                { tok: 'walked',  p: 0.05 },
                { tok: '… (50K others)', p: 0.15 }
            ];
            const barX = 320, barY0 = 110, barH = 30, gap = 12, barMax = 360;
            const bars = candidates.map((c, i) => {
                const w = c.p * barMax;
                const y = barY0 + i * (barH + gap);
                const fill = i === 0 ? '#7c3aed' : i < 5 ? '#a78bfa' : '#d1d5db';
                return `<g data-step="${i + 1}" class="step-highlight">
                    <text x="${barX - 12}" y="${y + 20}" text-anchor="end" fill="#1f2937" font-size="13" font-family="ui-monospace,Consolas,monospace" font-weight="600">${c.tok}</text>
                    <rect x="${barX}" y="${y}" width="${w}" height="${barH}" rx="4" fill="${fill}"/>
                    <text x="${barX + w + 8}" y="${y + 20}" fill="#4c1d95" font-size="13" font-weight="600">${(c.p * 100).toFixed(0)}%</text>
                </g>`;
            }).join('');

            return `<svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet">
                <text x="400" y="40" text-anchor="middle" fill="#4c1d95" font-size="20" font-weight="700">Prompt: "The cat ___"</text>
                <text x="400" y="68" text-anchor="middle" fill="#6b7280" font-size="13">Model assigns a probability to every token in its vocabulary</text>
                <text x="400" y="92" text-anchor="middle" fill="#6b7280" font-size="12" font-style="italic">Top candidates shown · sampling picks one according to temperature</text>
                ${bars}
                <text x="400" y="395" text-anchor="middle" fill="#4c1d95" font-size="13">temperature=0 → always "sat" · temperature=1 → samples weighted by probability</text>
            </svg>`;
        },

        // 4. RAG pipeline — 5-stage flow
        'rag-pipeline'(d) {
            const stages = [
                { x: 80,  label: '1. Query',      sub: '"How does X work?"',    color: '#0ea5e9' },
                { x: 240, label: '2. Embed',      sub: 'text → vector',          color: '#7c3aed' },
                { x: 400, label: '3. Retrieve',   sub: 'top-k from vector DB',   color: '#7c3aed' },
                { x: 560, label: '4. Augment',    sub: 'prompt + chunks',        color: '#a78bfa' },
                { x: 720, label: '5. Generate',   sub: 'grounded answer',        color: '#059669' }
            ];
            const boxes = stages.map((s, i) =>
                `<g data-step="${i + 1}" class="step-highlight">
                    <rect x="${s.x - 60}" y="180" width="120" height="80" rx="8" fill="#fff" stroke="${s.color}" stroke-width="2"/>
                    <text x="${s.x}" y="210" text-anchor="middle" fill="${s.color}" font-size="14" font-weight="700">${s.label}</text>
                    <text x="${s.x}" y="232" text-anchor="middle" fill="#4b5563" font-size="11">${s.sub}</text>
                </g>`
            ).join('');
            const arrows = stages.slice(0, -1).map((s, i) => {
                const x1 = s.x + 60, x2 = stages[i + 1].x - 60;
                return `<line x1="${x1}" y1="220" x2="${x2 - 8}" y2="220" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#ah-7c3aed)" class="anim-line"/>`;
            }).join('');

            // Vector DB cluster
            const dots = [];
            for (let i = 0; i < 14; i++) {
                const cx = 400 + (Math.random() - 0.5) * 180;
                const cy = 70 + Math.random() * 40;
                const r = 4 + Math.random() * 3;
                dots.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#a78bfa" opacity="0.6"/>`);
            }

            return `<svg viewBox="0 0 800 380" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed'])}</defs>
                <rect x="280" y="40" width="240" height="100" rx="10" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="6"/>
                <text x="400" y="32" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="700">Vector database</text>
                ${dots.join('')}
                <line x1="400" y1="140" x2="400" y2="180" stroke="#7c3aed" stroke-width="1.4" stroke-dasharray="4" marker-end="url(#ah-7c3aed)"/>
                ${boxes}
                ${arrows}
                <text x="400" y="320" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="600">Why RAG? → grounds answers in YOUR data, reduces hallucination, no retraining needed</text>
                <text x="400" y="345" text-anchor="middle" fill="#6b7280" font-size="11" font-style="italic">Embed at index time AND at query time using the SAME embedding model</text>
            </svg>`;
        },

        // 5. ReAct agent loop — circular flow
        'agent-loop'(d) {
            const cx = 400, cy = 200, r = 110;
            const nodes = [
                { angle: -90, label: 'Thought',     sub: 'reasoning',          color: '#7c3aed' },
                { angle: 30,  label: 'Action',      sub: 'tool call',          color: '#0ea5e9' },
                { angle: 150, label: 'Observation', sub: 'tool result',        color: '#059669' }
            ];
            const pts = nodes.map(n => {
                const rad = n.angle * Math.PI / 180;
                return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), ...n };
            });
            const boxes = pts.map((p, i) =>
                `<g data-step="${i + 1}" class="step-highlight">
                    <rect x="${p.x - 70}" y="${p.y - 28}" width="140" height="56" rx="10" fill="#fff" stroke="${p.color}" stroke-width="2.5"/>
                    <text x="${p.x}" y="${p.y - 6}" text-anchor="middle" fill="${p.color}" font-size="15" font-weight="700">${p.label}</text>
                    <text x="${p.x}" y="${p.y + 12}" text-anchor="middle" fill="#4b5563" font-size="11">${p.sub}</text>
                </g>`
            ).join('');
            const arcs = pts.map((p, i) => {
                const next = pts[(i + 1) % pts.length];
                return `<path d="M ${p.x},${p.y} A ${r * 0.95},${r * 0.95} 0 0,1 ${next.x},${next.y}"
                    fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#ah-7c3aed)" class="anim-line" stroke-dasharray="6 6"/>`;
            }).join('');
            return `<svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed'])}</defs>
                <text x="400" y="40" text-anchor="middle" fill="#4c1d95" font-size="20" font-weight="700">ReAct: Reason + Act loop</text>
                ${arcs}
                ${boxes}
                <circle cx="${cx}" cy="${cy}" r="32" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
                <text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#4c1d95" font-size="11" font-weight="700">repeat until</text>
                <text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="#4c1d95" font-size="11" font-weight="700">done</text>
                <text x="400" y="380" text-anchor="middle" fill="#4b5563" font-size="13">Each cycle the model decides: keep going, call another tool, or finish.</text>
            </svg>`;
        },

        // 6. Tool / function calling — sequence diagram
        'tool-calling'(d) {
            const lanes = [
                { x: 140, label: 'User',     color: '#6b7280' },
                { x: 360, label: 'Model',    color: '#7c3aed' },
                { x: 580, label: 'Your app', color: '#0ea5e9' },
                { x: 720, label: 'Tool / API', color: '#059669' }
            ];
            const headers = lanes.map(l =>
                `<rect x="${l.x - 60}" y="40" width="120" height="36" rx="6" fill="${l.color}"/>
                 <text x="${l.x}" y="64" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">${l.label}</text>
                 <line x1="${l.x}" y1="76" x2="${l.x}" y2="380" stroke="#d1d5db" stroke-width="1" stroke-dasharray="3"/>`
            ).join('');
            const msgs = [
                { from: 0, to: 1, y: 110, text: '"What is the weather in Paris?"',                step: 1 },
                { from: 1, to: 2, y: 160, text: '{"tool_call": "get_weather", "args": {"city":"Paris"}}', step: 2, color: '#7c3aed' },
                { from: 2, to: 3, y: 210, text: 'HTTPS GET api.weather.com/?city=Paris',         step: 3, color: '#0ea5e9' },
                { from: 3, to: 2, y: 250, text: '{"temp": 14, "cond": "rain"}',                  step: 4, color: '#059669', back: true },
                { from: 2, to: 1, y: 290, text: 'tool_result message',                            step: 5, color: '#0ea5e9', back: true },
                { from: 1, to: 0, y: 340, text: '"It is 14°C and raining in Paris."',            step: 6, color: '#7c3aed', back: true }
            ];
            const arrows = msgs.map(m => {
                const x1 = lanes[m.from].x, x2 = lanes[m.to].x;
                const c  = m.color || '#374151';
                return `<g data-step="${m.step}" class="step-highlight">
                    <line x1="${x1}" y1="${m.y}" x2="${x2}" y2="${m.y}" stroke="${c}" stroke-width="2" marker-end="url(#ah-${c.replace('#','')})" class="anim-line"/>
                    <text x="${(x1 + x2) / 2}" y="${m.y - 6}" text-anchor="middle" fill="${c}" font-size="11" font-family="ui-monospace,Consolas,monospace">${m.text}</text>
                </g>`;
            }).join('');
            const colors = ['#374151', '#7c3aed', '#0ea5e9', '#059669'];
            return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(colors)}</defs>
                ${headers}
                ${arrows}
            </svg>`;
        },

        // 7. MCP architecture — client/server with surfaces
        'mcp-architecture'(d) {
            return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#7c3aed', '#0ea5e9'])}</defs>
                <!-- Client (host app) -->
                <g data-step="1" class="step-highlight">
                    <rect x="40" y="80" width="240" height="240" rx="12" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
                    <text x="160" y="108" text-anchor="middle" fill="#4c1d95" font-size="15" font-weight="700">MCP Client</text>
                    <text x="160" y="128" text-anchor="middle" fill="#6b7280" font-size="11">(Claude Desktop, Copilot, IDE…)</text>
                    <rect x="70" y="150" width="180" height="40" rx="6" fill="#ede9fe" stroke="#7c3aed"/>
                    <text x="160" y="175" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="600">LLM agent</text>
                    <rect x="70" y="200" width="180" height="40" rx="6" fill="#ede9fe" stroke="#7c3aed"/>
                    <text x="160" y="225" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="600">MCP runtime</text>
                </g>

                <!-- Transport -->
                <g data-step="2" class="step-highlight">
                    <line x1="280" y1="200" x2="520" y2="200" stroke="#7c3aed" stroke-width="2" marker-end="url(#ah-7c3aed)" stroke-dasharray="6" class="anim-line"/>
                    <line x1="520" y1="220" x2="280" y2="220" stroke="#0ea5e9" stroke-width="2" marker-end="url(#ah-0ea5e9)" stroke-dasharray="6" class="anim-line"/>
                    <text x="400" y="186" text-anchor="middle" fill="#4c1d95" font-size="12" font-weight="600">JSON-RPC</text>
                    <text x="400" y="246" text-anchor="middle" fill="#6b7280" font-size="11">stdio · HTTP · WebSocket</text>
                </g>

                <!-- Server -->
                <g data-step="3" class="step-highlight">
                    <rect x="520" y="80" width="240" height="240" rx="12" fill="#fff" stroke="#0ea5e9" stroke-width="2"/>
                    <text x="640" y="108" text-anchor="middle" fill="#0c4a6e" font-size="15" font-weight="700">MCP Server</text>
                    <text x="640" y="128" text-anchor="middle" fill="#6b7280" font-size="11">(GitHub, Filesystem, custom…)</text>
                    <rect x="550" y="148" width="180" height="34" rx="6" fill="#e0f2fe" stroke="#0ea5e9"/>
                    <text x="640" y="170" text-anchor="middle" fill="#0c4a6e" font-size="12" font-weight="600">🛠 tools (functions)</text>
                    <rect x="550" y="190" width="180" height="34" rx="6" fill="#e0f2fe" stroke="#0ea5e9"/>
                    <text x="640" y="212" text-anchor="middle" fill="#0c4a6e" font-size="12" font-weight="600">📄 resources (data)</text>
                    <rect x="550" y="232" width="180" height="34" rx="6" fill="#e0f2fe" stroke="#0ea5e9"/>
                    <text x="640" y="254" text-anchor="middle" fill="#0c4a6e" font-size="12" font-weight="600">💬 prompts (templates)</text>
                </g>

                <text x="400" y="365" text-anchor="middle" fill="#4c1d95" font-size="13" font-weight="600">One protocol → any client can use any server's tools, data, and prompt templates.</text>
            </svg>`;
        },

        // 8. Multi-agent orchestrator — fan-out
        'multi-agent'(d) {
            const orch = { x: 400, y: 80 };
            const workers = [
                { x: 130, label: 'Researcher', sub: 'web search',     color: '#0ea5e9' },
                { x: 290, label: 'Writer',     sub: 'drafting',       color: '#7c3aed' },
                { x: 510, label: 'Coder',      sub: 'implementation', color: '#059669' },
                { x: 670, label: 'Reviewer',   sub: 'critique',       color: '#dc2626' }
            ];
            const wY = 240;
            const orchG = `<g data-step="1" class="step-highlight">
                <rect x="${orch.x - 100}" y="${orch.y - 30}" width="200" height="60" rx="10" fill="#7c3aed"/>
                <text x="${orch.x}" y="${orch.y - 6}" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">Orchestrator</text>
                <text x="${orch.x}" y="${orch.y + 14}" text-anchor="middle" fill="#ede9fe" font-size="11">plans · dispatches · merges</text>
            </g>`;
            const wG = workers.map((w, i) =>
                `<g data-step="${i + 2}" class="step-highlight">
                    <rect x="${w.x - 70}" y="${wY}" width="140" height="60" rx="10" fill="#fff" stroke="${w.color}" stroke-width="2"/>
                    <text x="${w.x}" y="${wY + 26}" text-anchor="middle" fill="${w.color}" font-size="14" font-weight="700">${w.label}</text>
                    <text x="${w.x}" y="${wY + 44}" text-anchor="middle" fill="#4b5563" font-size="11">${w.sub}</text>
                    <line x1="${orch.x}" y1="${orch.y + 30}" x2="${w.x}" y2="${wY - 4}" stroke="${w.color}" stroke-width="1.6" marker-end="url(#ah-${w.color.replace('#','')})" class="anim-line"/>
                </g>`
            ).join('');
            return `<svg viewBox="0 0 800 380" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#0ea5e9', '#7c3aed', '#059669', '#dc2626'])}</defs>
                <text x="400" y="36" text-anchor="middle" fill="#4c1d95" font-size="18" font-weight="700">Orchestrator–Worker Pattern</text>
                ${orchG}${wG}
                <text x="400" y="340" text-anchor="middle" fill="#4b5563" font-size="13">Workers run in parallel. Orchestrator merges results into a final answer.</text>
                <text x="400" y="360" text-anchor="middle" fill="#6b7280" font-size="11" font-style="italic">Other patterns: debate, hand-off, hierarchical, swarm.</text>
            </svg>`;
        },

        // 9. Embedding space — 2D scatter with clusters
        'embedding-space'(d) {
            const clusters = [
                { color: '#7c3aed', label: 'Animals',     points: [[160, 110], [180, 140], [140, 150], [170, 170], [200, 130], [150, 175]] },
                { color: '#0ea5e9', label: 'Vehicles',    points: [[480, 110], [510, 140], [460, 165], [530, 130], [500, 180], [475, 145]] },
                { color: '#059669', label: 'Programming', points: [[280, 280], [320, 300], [260, 310], [310, 270], [340, 295]] },
                { color: '#dc2626', label: 'Food',        points: [[600, 290], [630, 270], [580, 310], [640, 305], [610, 320]] }
            ];
            const labels = ['cat', 'dog', 'rabbit', 'horse', 'cow', 'sheep', 'car', 'truck', 'bike', 'bus', 'plane', 'boat', 'python', 'javascript', 'rust', 'go', 'java', 'pizza', 'sushi', 'curry', 'pasta', 'tacos'];
            let li = 0;
            // Wrap each cluster in its own data-step group so Step controls highlight one cluster at a time.
            const dots = clusters.map((c, i) => {
                const inner = c.points.map(p => {
                    const lbl = labels[li++] || '';
                    return `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="${c.color}" opacity="0.85"/><text x="${p[0] + 10}" y="${p[1] + 4}" fill="#1f2937" font-size="11">${lbl}</text>`;
                }).join('');
                return `<g data-step="${i + 1}" class="step-highlight">${inner}</g>`;
            }).join('');

            // Highlighted query point + nearest neighbour line (step 5)
            const query = { x: 200, y: 145 };
            const nearest = { x: 180, y: 140 };
            const queryGroup = `<g data-step="5" class="step-highlight">
                <circle cx="${query.x}" cy="${query.y}" r="10" fill="none" stroke="#dc2626" stroke-width="2"/>
                <text x="${query.x + 14}" y="${query.y - 8}" fill="#dc2626" font-size="11" font-weight="700">query: "kitten"</text>
                <line x1="${query.x}" y1="${query.y}" x2="${nearest.x + 6}" y2="${nearest.y + 2}" stroke="#dc2626" stroke-width="1.5" marker-end="url(#ah-dc2626)" stroke-dasharray="4"/>
            </g>`;

            return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                <defs>${this.arrowDefs(['#dc2626'])}</defs>
                <rect x="40" y="60" width="720" height="300" rx="8" fill="#fafafa" stroke="#d1d5db"/>
                <text x="400" y="40" text-anchor="middle" fill="#4c1d95" font-size="16" font-weight="700">Embedding space (2-D projection of 1536-D vectors)</text>
                ${dots}
                ${queryGroup}
                <text x="400" y="386" text-anchor="middle" fill="#4b5563" font-size="13">Similar concepts cluster together. Cosine similarity finds nearest neighbours.</text>
            </svg>`;
        },

        // 10. Context-window decay — line chart accuracy vs position
        'context-decay'(d) {
            const w = 700, h = 240, x0 = 60, y0 = 40;
            // U-shaped curve: high at start, dip in middle, slight rise at end
            const pts = [];
            for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const u = 0.95 - 0.55 * Math.sin(Math.PI * t) + 0.10 * (t > 0.85 ? 1 : 0) - 0.04 * t;
                const x = x0 + t * w;
                const y = y0 + (1 - Math.max(0, Math.min(1, u))) * h;
                pts.push(`${x},${y}`);
            }
            const polyline = `<polyline points="${pts.join(' ')}" fill="none" stroke="#7c3aed" stroke-width="2.5" class="anim-line"/>`;

            // Axes
            const axes = `
                <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + h}" stroke="#1f2937" stroke-width="1.5"/>
                <line x1="${x0}" y1="${y0 + h}" x2="${x0 + w}" y2="${y0 + h}" stroke="#1f2937" stroke-width="1.5"/>
                <text x="${x0 - 14}" y="${y0 + 10}" text-anchor="end" fill="#1f2937" font-size="11">100%</text>
                <text x="${x0 - 14}" y="${y0 + h / 2}" text-anchor="end" fill="#1f2937" font-size="11">50%</text>
                <text x="${x0 - 14}" y="${y0 + h}" text-anchor="end" fill="#1f2937" font-size="11">0%</text>
                <text x="${x0}" y="${y0 + h + 22}" fill="#1f2937" font-size="12">start</text>
                <text x="${x0 + w / 2}" y="${y0 + h + 22}" text-anchor="middle" fill="#1f2937" font-size="12">middle of context</text>
                <text x="${x0 + w}" y="${y0 + h + 22}" text-anchor="end" fill="#1f2937" font-size="12">end</text>
                <text x="${x0 + w / 2}" y="${y0 - 10}" text-anchor="middle" fill="#4c1d95" font-size="14" font-weight="700">Recall accuracy vs position in long context</text>`;

            // Annotations (steps)
            const annot = `
                <g data-step="1" class="step-highlight">
                    <circle cx="${x0 + 30}" cy="${y0 + 30}" r="6" fill="#059669"/>
                    <text x="${x0 + 42}" y="${y0 + 34}" fill="#059669" font-size="12" font-weight="600">High recall: recent system prompt + first instructions</text>
                </g>
                <g data-step="2" class="step-highlight">
                    <circle cx="${x0 + w / 2}" cy="${y0 + h - 40}" r="6" fill="#dc2626"/>
                    <text x="${x0 + w / 2 + 12}" y="${y0 + h - 36}" fill="#dc2626" font-size="12" font-weight="600">"Lost in the middle" — needles get missed</text>
                </g>
                <g data-step="3" class="step-highlight">
                    <circle cx="${x0 + w - 40}" cy="${y0 + 50}" r="6" fill="#7c3aed"/>
                    <text x="${x0 + w - 50}" y="${y0 + 46}" text-anchor="end" fill="#7c3aed" font-size="12" font-weight="600">Recency boost: most recent turn weighted heavily</text>
                </g>`;

            return `<svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid meet">
                ${axes}${polyline}${annot}
                <text x="400" y="340" text-anchor="middle" fill="#4b5563" font-size="12" font-style="italic">Mitigations: re-state critical info near the end · use RAG · chunk + summarise long inputs</text>
            </svg>`;
        },

        'claude-code-workflow'(d) {
            const colors = ['#7c3aed','#059669','#2563eb','#d97706','#dc2626'];
            const defs = this.arrowDefs ? DiagramEngine.arrowDefs(colors) : '';
            const boxes = [
                { x: 50,  y: 30,  w: 130, h: 50, label: 'CLAUDE.md',       sub: 'Project context',     fill: '#ede9fe', stroke: '#7c3aed' },
                { x: 50,  y: 110, w: 130, h: 50, label: 'User Prompt',     sub: '"Add auth to API"',    fill: '#ecfdf5', stroke: '#059669' },
                { x: 250, y: 70,  w: 140, h: 50, label: '🧠 Claude Code',  sub: 'Plan & reason',        fill: '#f0f0ff', stroke: '#2563eb' },
                { x: 460, y: 30,  w: 120, h: 44, label: 'Read Files',      sub: 'grep · glob · view',   fill: '#fefce8', stroke: '#d97706' },
                { x: 460, y: 86,  w: 120, h: 44, label: 'Edit Code',       sub: 'create · edit',        fill: '#fefce8', stroke: '#d97706' },
                { x: 460, y: 142, w: 120, h: 44, label: 'Run Commands',    sub: 'test · build · lint',  fill: '#fefce8', stroke: '#d97706' },
                { x: 460, y: 198, w: 120, h: 44, label: 'MCP Tools',       sub: 'DB · API · search',    fill: '#fefce8', stroke: '#d97706' },
                { x: 650, y: 100, w: 120, h: 50, label: 'Verify & Commit', sub: 'tests pass → git',     fill: '#ecfdf5', stroke: '#059669' }
            ];
            const arrows = [
                { x1: 180, y1: 55,  x2: 248, y2: 85,  c: '#7c3aed' },
                { x1: 180, y1: 135, x2: 248, y2: 105, c: '#059669' },
                { x1: 390, y1: 95,  x2: 458, y2: 52,  c: '#2563eb' },
                { x1: 390, y1: 95,  x2: 458, y2: 108, c: '#2563eb' },
                { x1: 390, y1: 95,  x2: 458, y2: 164, c: '#2563eb' },
                { x1: 390, y1: 95,  x2: 458, y2: 220, c: '#2563eb' },
                { x1: 580, y1: 108, x2: 648, y2: 120, c: '#d97706' },
                { x1: 580, y1: 164, x2: 648, y2: 130, c: '#d97706' }
            ];
            const rects = boxes.map(b => `
                <g data-step="${boxes.indexOf(b) + 1}" class="step-highlight">
                    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="8" fill="${b.fill}" stroke="${b.stroke}" stroke-width="1.5"/>
                    <text x="${b.x + b.w/2}" y="${b.y + 20}" text-anchor="middle" fill="#1f2937" font-size="12" font-weight="700">${b.label}</text>
                    <text x="${b.x + b.w/2}" y="${b.y + 36}" text-anchor="middle" fill="#6b7280" font-size="10">${b.sub}</text>
                </g>`).join('');
            const lines = arrows.map(a => `<line x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="${a.c}" stroke-width="1.5" marker-end="url(#ah-${a.c.replace('#','')})"/>`).join('');
            return `<svg viewBox="0 0 800 280" preserveAspectRatio="xMidYMid meet">
                <defs>${defs}</defs>
                <text x="400" y="18" text-anchor="middle" fill="#4c1d95" font-size="14" font-weight="700">Claude Code Agentic Workflow</text>
                ${lines}${rects}
                <text x="400" y="270" text-anchor="middle" fill="#4b5563" font-size="11" font-style="italic">Loop: read → plan → edit → test → verify → commit</text>
            </svg>`;
        },

        'fullstack-deploy'(d) {
            const colors = ['#7c3aed','#059669','#2563eb','#d97706','#dc2626'];
            const defs = DiagramEngine.arrowDefs(colors);
            const layers = [
                { x: 20,  y: 40,  w: 160, h: 200, label: 'Frontend',       items: ['React / Next.js','Tailwind CSS','Vercel / Pages'], fill: '#ede9fe', stroke: '#7c3aed' },
                { x: 210, y: 40,  w: 160, h: 200, label: 'Backend API',    items: ['FastAPI / Express','Auth middleware','Rate limiting'], fill: '#ecfdf5', stroke: '#059669' },
                { x: 400, y: 40,  w: 160, h: 200, label: 'AI Layer',       items: ['LLM API calls','RAG pipeline','Agent orchestration'], fill: '#dbeafe', stroke: '#2563eb' },
                { x: 590, y: 40,  w: 160, h: 200, label: 'Infrastructure', items: ['Vector DB','PostgreSQL','Redis cache'], fill: '#fefce8', stroke: '#d97706' }
            ];
            const layerSvg = layers.map((l, i) => {
                const itemsHtml = l.items.map((item, j) =>
                    `<text x="${l.x + l.w/2}" y="${l.y + 75 + j * 28}" text-anchor="middle" fill="#374151" font-size="11">• ${item}</text>`
                ).join('');
                return `
                <g data-step="${i + 1}" class="step-highlight">
                    <rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" rx="10" fill="${l.fill}" stroke="${l.stroke}" stroke-width="1.5"/>
                    <text x="${l.x + l.w/2}" y="${l.y + 24}" text-anchor="middle" fill="#1f2937" font-size="13" font-weight="700">${l.label}</text>
                    <line x1="${l.x + 10}" y1="${l.y + 36}" x2="${l.x + l.w - 10}" y2="${l.y + 36}" stroke="${l.stroke}" stroke-width="0.5"/>
                    ${itemsHtml}
                </g>`;
            }).join('');
            const arrows = [
                `<line x1="180" y1="140" x2="208" y2="140" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#ah-7c3aed)"/>`,
                `<line x1="370" y1="140" x2="398" y2="140" stroke="#059669" stroke-width="1.5" marker-end="url(#ah-059669)"/>`,
                `<line x1="560" y1="140" x2="588" y2="140" stroke="#2563eb" stroke-width="1.5" marker-end="url(#ah-2563eb)"/>`
            ].join('');
            const cicd = `
                <rect x="20" y="265" width="730" height="40" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="1"/>
                <text x="385" y="290" text-anchor="middle" fill="#dc2626" font-size="12" font-weight="700">CI/CD Pipeline: GitHub Actions → Build → Test → Deploy → Monitor</text>`;
            return `<svg viewBox="0 0 780 320" preserveAspectRatio="xMidYMid meet">
                <defs>${defs}</defs>
                <text x="390" y="24" text-anchor="middle" fill="#4c1d95" font-size="14" font-weight="700">Full-Stack AI Application Architecture</text>
                ${layerSvg}${arrows}${cicd}
            </svg>`;
        },

        // Fallback
        '_fallback'(d) {
            return `<svg viewBox="0 0 800 200"><text x="400" y="100" text-anchor="middle" fill="#6b7280" font-size="14">Diagram type "${d.type}" not yet implemented.</text></svg>`;
        }
    }
};
