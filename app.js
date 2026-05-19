const runwayCenterElevationMsl = 760;
const runway03ElevationMsl = 770;
const runway21ElevationMsl = 750;
const aerodromeElevationMsl = Math.max(runway03ElevationMsl, runway21ElevationMsl);
const terrainElevationMsl = 813;
const siloTopMsl = 851;
const verticalScale = 5;

const points = {
  silo: { x: -2420.765, y: -202.424, lat: -17.06903, lon: -51.098031 },
  rwy03: { x: -1200, y: 0 },
  rwy21: { x: 1200, y: 0 },
  lda03Threshold: { x: -900, y: 0 },
  toda21End: { x: -1400, y: 0 }
};

function runwayElevationAtX(x) {
  return runwayCenterElevationMsl - x / 120;
}

function mslToLocalHeight(msl) {
  return msl - runwayCenterElevationMsl;
}

const lda03ElevationMsl = runwayElevationAtX(points.lda03Threshold.x);
const toda21ElevationMsl = runwayElevationAtX(points.toda21End.x);
const horizontalLimitMsl = aerodromeElevationMsl + 90;
const transitionTopMsl = aerodromeElevationMsl + 45;
const transitionSlope = 1 / 7;

function approach03OesMsl(x) {
  return lda03ElevationMsl + Math.max(0, points.lda03Threshold.x - 60 - x) * 0.0333;
}

function takeoff21Msl(x) {
  return toda21ElevationMsl + Math.max(0, points.toda21End.x - x) * 0.02;
}

function departure21Msl(x) {
  return toda21ElevationMsl + 5 + Math.max(0, points.toda21End.x - x) * 0.025;
}

function transitionRunwayOuterY(x) {
  return 150 + (transitionTopMsl - runwayElevationAtX(x)) / transitionSlope;
}

function transitionApproachLimitX() {
  return points.lda03Threshold.x - 60 - ((transitionTopMsl - lda03ElevationMsl) / 0.0333);
}

function approach03HalfWidth(x) {
  return 77.5 + Math.max(0, -960 - x) * 0.10;
}

function transitionApproachOuterYAtInnerEdge() {
  return 77.5 + (transitionTopMsl - lda03ElevationMsl) / transitionSlope;
}

function transitionMsl(x, y) {
  const absY = Math.abs(y);
  if (x >= -1260 && x <= 1260 && absY >= 150) {
    const base = runwayElevationAtX(x);
    return Math.min(transitionTopMsl, base + (absY - 150) * transitionSlope);
  }

  const xLimit = transitionApproachLimitX();
  if (x <= -960 && x >= xLimit) {
    const halfWidth = approach03HalfWidth(x);
    const base = approach03OesMsl(x);
    return Math.min(transitionTopMsl, base + Math.max(0, absY - halfWidth) * transitionSlope);
  }

  return transitionTopMsl;
}

const colors = {
  runway: "#1b2a31",
  strip: "#0097a7",
  approach: "#18a957",
  takeoff: "#d34b2f",
  departure: "#9b4fd2",
  horizontal: "#2f7ed8",
  legacy: "#8a7b2e",
  silo: "#d7193f"
};

const surfaces = [
  {
    id: "strip",
    name: "Faixa de pista",
    color: colors.strip,
    opacity: 0.18,
    show: true,
    points: [[-1260, -150], [1260, -150], [1260, 150], [-1260, 150]],
    z: (x) => mslToLocalHeight(runwayElevationAtX(x))
  },
  {
    id: "approach03",
    name: "OFS aproximacao RWY 03",
    color: colors.approach,
    opacity: 0.28,
    show: true,
    points: [[-960, -77.5], [-960, 77.5], [-5460, 527.5], [-5460, -527.5]],
    z: (x) => mslToLocalHeight(approach03OesMsl(x))
  },
  {
    id: "transition",
    name: "OFS superficie de transicao",
    color: "#0a7d4f",
    opacity: 0.24,
    show: true,
    parts: [
      [[-1260, 150], [1260, 150], [1260, transitionRunwayOuterY(1260)], [-1260, transitionRunwayOuterY(-1260)]],
      [[-1260, -150], [1260, -150], [1260, -transitionRunwayOuterY(1260)], [-1260, -transitionRunwayOuterY(-1260)]],
      [[-960, 77.5], [transitionApproachLimitX(), approach03HalfWidth(transitionApproachLimitX())], [-960, transitionApproachOuterYAtInnerEdge()]],
      [[-960, -77.5], [transitionApproachLimitX(), -approach03HalfWidth(transitionApproachLimitX())], [-960, -transitionApproachOuterYAtInnerEdge()]]
    ],
    z: (x, y) => mslToLocalHeight(transitionMsl(x, y))
  },
  {
    id: "approach21",
    name: "OFS aproximacao RWY 21",
    color: "#7fcf6f",
    opacity: 0.18,
    show: true,
    points: [[1260, -77.5], [1260, 77.5], [5760, 527.5], [5760, -527.5]],
    z: (x) => mslToLocalHeight(runway21ElevationMsl + Math.max(0, x - 1260) * 0.0333)
  },
  {
    id: "takeoff21",
    name: "OES subida decolagem RWY 21",
    color: colors.takeoff,
    opacity: 0.26,
    show: true,
    points: [[-1400, -78], [-1400, 78], [-11400, 900], [-11400, -900]],
    z: (x) => mslToLocalHeight(takeoff21Msl(x))
  },
  {
    id: "takeoff03",
    name: "OES subida decolagem RWY 03",
    color: "#ec7f37",
    opacity: 0.14,
    show: true,
    points: [[1200, -78], [1200, 78], [11200, 900], [11200, -900]],
    z: (x) => mslToLocalHeight(runway21ElevationMsl + Math.max(0, x - 1200) * 0.02)
  },
  {
    id: "departure21",
    name: "OES saida IFR RWY 21",
    color: colors.departure,
    opacity: 0.23,
    show: true,
    points: [[-1400, -150], [-1400, 150], [-4900, 1088], [-13200, 5885.4], [-13200, -5885.4], [-4900, -1088]],
    z: (x) => mslToLocalHeight(departure21Msl(x))
  },
  {
    id: "departure03",
    name: "OES saida IFR RWY 03",
    color: "#c279ff",
    opacity: 0.12,
    show: false,
    points: [[1200, -150], [1200, 150], [4700, 1088], [13000, 5885.4], [13000, -5885.4], [4700, -1088]],
    z: (x) => mslToLocalHeight(runway21ElevationMsl + 5 + Math.max(0, x - 1200) * 0.025)
  },
  {
    id: "horizontal",
    name: "OES horizontal ADG IIC",
    color: colors.horizontal,
    opacity: 0.10,
    show: false,
    points: capsule([-900, 0], [1200, 0], 10750, 64),
    z: () => mslToLocalHeight(horizontalLimitMsl)
  },
  {
    id: "classicHorizontal",
    name: "Horizontal interna classica",
    color: colors.legacy,
    opacity: 0.10,
    show: false,
    points: capsule([-900, 0], [1200, 0], 4000, 48),
    z: () => mslToLocalHeight(aerodromeElevationMsl + 45)
  }
];

const results = [
  ["Faixa de pista", "Sim", "x fora da faixa; |y| = 202,4 m > 150 m", "N/A", "851,0 m", "Nao", "0,0 m"],
  ["OFS aproximacao RWY 03", "Sim", "1460,8 m desde a borda interna; |y| = 202,4 m", "816,1 m", "851,0 m", "Sim", "34,9 m"],
  ["OFS transicao", "Sim", "Ponto dentro da aproximacao RWY 03; aproximacao controla", "816,1 m", "851,0 m", "Sim, por aproximacao", "34,9 m"],
  ["OFS aproximacao interna", "Sim", "Fora: 1460,8 m > 1350 m e |y| = 202,4 m > 60 m", "N/A", "851,0 m", "Nao", "0,0 m"],
  ["OFS transicao interna", "Sim", "Fora da aproximacao interna", "N/A", "851,0 m", "Nao", "0,0 m"],
  ["OES horizontal ADG IIC", "Sim", "Dentro do raio 10750 m; referencia = elevacao do aerodromo 770 m", "860,0 m", "851,0 m", "Nao", "0,0 m"],
  ["OES saida IFR RWY 21", "Condicional", "1020,8 m alem da TODA 21; meia-largura 423,6 m", "802,2 m", "851,0 m", "Sim", "48,8 m"],
  ["OES subida decolagem RWY 21", "Sim", "1020,8 m alem da TODA 21; meia-largura 205,6 m", "792,1 m", "851,0 m", "Sim", "58,9 m"]
];

const views = {
  near: [-6000, -1200, 8000, 2400],
  full: [-16200, -6200, 32400, 12400]
};

const map = document.getElementById("map2d");
const controls = document.getElementById("surface-controls");
let currentView = "near";
let sceneObjects = new Map();
let camera;
let controls3d;

function capsule(a, b, radius, steps) {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = -Math.PI / 2 + (Math.PI * i) / steps;
    pts.push([x2 + Math.cos(angle) * radius, y2 + Math.sin(angle) * radius]);
  }
  for (let i = 0; i <= steps; i += 1) {
    const angle = Math.PI / 2 + (Math.PI * i) / steps;
    pts.push([x1 + Math.cos(angle) * radius, y1 + Math.sin(angle) * radius]);
  }
  return pts;
}

function fmtPoint(point) {
  return `${point[0].toFixed(1)},${(-point[1]).toFixed(1)}`;
}

function localToSvg(point) {
  return [point[0], -point[1]];
}

function polygonPoints(pointsList) {
  return pointsList.map((point) => fmtPoint(point)).join(" ");
}

function surfaceParts(surface) {
  return surface.parts || [surface.points];
}

function svgElement(name, attrs = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function buildSurfaceControls() {
  controls.innerHTML = "";
  surfaces.forEach((surface) => {
    const label = document.createElement("label");
    label.className = "surface-toggle";
    label.innerHTML = `
      <input type="checkbox" data-surface="${surface.id}" ${surface.show ? "checked" : ""}>
      <span class="swatch" style="background:${surface.color}"></span>
      <span>${surface.name}</span>
    `;
    controls.appendChild(label);
  });

  controls.addEventListener("change", (event) => {
    const input = event.target.closest("input[data-surface]");
    if (!input) return;
    const surface = surfaces.find((item) => item.id === input.dataset.surface);
    surface.show = input.checked;
    renderMap();
    const object = sceneObjects.get(surface.id);
    if (object) object.visible = surface.show;
  });
}

function drawGrid(root) {
  const [minX, minY, width, height] = views[currentView];
  const maxX = minX + width;
  const maxY = minY + height;
  const step = currentView === "near" ? 500 : 2000;

  for (let x = Math.ceil(minX / step) * step; x <= maxX; x += step) {
    root.appendChild(svgElement("line", {
      x1: x,
      y1: minY,
      x2: x,
      y2: maxY,
      stroke: "var(--grid)",
      "stroke-width": currentView === "near" ? 7 : 20
    }));
  }

  for (let y = Math.ceil(minY / step) * step; y <= maxY; y += step) {
    root.appendChild(svgElement("line", {
      x1: minX,
      y1: y,
      x2: maxX,
      y2: y,
      stroke: "var(--grid)",
      "stroke-width": currentView === "near" ? 7 : 20
    }));
  }

  root.appendChild(svgElement("line", { x1: minX, y1: 0, x2: maxX, y2: 0, stroke: "#8fa09a", "stroke-width": currentView === "near" ? 9 : 24 }));
  root.appendChild(svgElement("line", { x1: 0, y1: minY, x2: 0, y2: maxY, stroke: "#c7d0cc", "stroke-width": currentView === "near" ? 6 : 18 }));
}

function drawText(root, text, x, y, className = "map-label") {
  const label = svgElement("text", { x, y: -y, class: className });
  label.textContent = text;
  root.appendChild(label);
}

function renderMap() {
  const [minX, minY, width, height] = views[currentView];
  map.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);
  map.innerHTML = "";
  drawGrid(map);

  surfaces.forEach((surface) => {
    if (!surface.show) return;
    surfaceParts(surface).forEach((part) => {
      map.appendChild(svgElement("polygon", {
        points: polygonPoints(part),
        fill: surface.color,
        "fill-opacity": surface.opacity,
        stroke: surface.color,
        "stroke-width": currentView === "near" ? 10 : 32,
        "vector-effect": "non-scaling-stroke"
      }));
    });
  });

  map.appendChild(svgElement("polygon", {
    points: polygonPoints([[-1200, -22.5], [1200, -22.5], [1200, 22.5], [-1200, 22.5]]),
    fill: colors.runway,
    stroke: colors.runway,
    "stroke-width": 7,
    "vector-effect": "non-scaling-stroke"
  }));

  drawDeclaredMarkers(map);
  drawSilo(map);
  drawText(map, "RWY 03", -1180, 130, "map-label small");
  drawText(map, "RWY 21", 680, 130, "map-label small");
  drawText(map, "Silo", points.silo.x + 120, points.silo.y - 70, "map-label");
  drawText(map, "x / eixo da pista", minX + 140, -maxVisibleY() + 125, "axis-label");
}

function maxVisibleY() {
  const [, minY, , height] = views[currentView];
  return minY + height;
}

function drawDeclaredMarkers(root) {
  [
    ["fim TODA 21", points.toda21End, colors.takeoff, -430, -210],
    ["CAB 03 fisica", points.rwy03, "#13201b", -330, 255],
    ["LDA 03", points.lda03Threshold, colors.approach, 80, 225],
    ["CAB 21", points.rwy21, "#13201b", -520, 120]
  ].forEach(([label, point, color]) => {
    const marker = svgElement("circle", {
      cx: point.x,
      cy: -point.y,
      r: currentView === "near" ? 38 : 105,
      fill: color,
      stroke: "#fff",
      "stroke-width": currentView === "near" ? 8 : 24
    });
    const title = svgElement("title");
    title.textContent = label;
    marker.appendChild(title);
    root.appendChild(marker);
  });
}

function drawSilo(root) {
  const halo = svgElement("circle", {
    cx: points.silo.x,
    cy: -points.silo.y,
    r: currentView === "near" ? 75 : 180,
    fill: colors.silo,
    "fill-opacity": 0.16,
    stroke: colors.silo,
    "stroke-width": currentView === "near" ? 12 : 32
  });
  const dot = svgElement("circle", {
    cx: points.silo.x,
    cy: -points.silo.y,
    r: currentView === "near" ? 28 : 78,
    fill: colors.silo,
    stroke: "#fff",
    "stroke-width": currentView === "near" ? 8 : 24
  });
  root.appendChild(halo);
  root.appendChild(dot);
}

function sectionPoint(distance, msl) {
  return `${distance.toFixed(1)},${(-msl).toFixed(1)}`;
}

function sectionPath(samples) {
  return samples.map(([distance, msl], index) => `${index === 0 ? "M" : "L"} ${sectionPoint(distance, msl)}`).join(" ");
}

function drawSectionText(root, text, distance, msl, className = "cut-label") {
  const label = svgElement("text", { x: distance, y: -msl, class: className });
  label.textContent = text;
  root.appendChild(label);
}

function renderSectionCut() {
  const svg = document.getElementById("section2d");
  if (!svg) return;

  const threshold = points.lda03Threshold;
  const dx = threshold.x - points.silo.x;
  const dy = threshold.y - points.silo.y;
  const total = Math.hypot(dx, dy);
  const ux = dx / total;
  const minMsl = 740;
  const maxMsl = 860;

  svg.setAttribute("viewBox", `-80 ${-maxMsl} ${total + 180} ${maxMsl - minMsl}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.innerHTML = "";

  for (let d = 0; d <= total + 1; d += 250) {
    svg.appendChild(svgElement("line", {
      x1: d,
      y1: -minMsl,
      x2: d,
      y2: -maxMsl,
      stroke: "var(--grid)",
      "stroke-width": 1
    }));
  }
  for (let z = minMsl; z <= maxMsl; z += 10) {
    svg.appendChild(svgElement("line", {
      x1: -80,
      y1: -z,
      x2: total + 100,
      y2: -z,
      stroke: "var(--grid)",
      "stroke-width": 1
    }));
    drawSectionText(svg, `${z} m`, -72, z + 1.5, "cut-axis");
  }

  const samples = [];
  const takeoffSamples = [];
  const departureSamples = [];
  const groundSamples = [];
  for (let i = 0; i <= 80; i += 1) {
    const d = (total * i) / 80;
    const x = points.silo.x + ux * d;
    samples.push([d, approach03OesMsl(x)]);
    groundSamples.push([d, terrainElevationMsl + (lda03ElevationMsl - terrainElevationMsl) * (d / total)]);
    if (x <= points.toda21End.x) {
      takeoffSamples.push([d, takeoff21Msl(x)]);
      departureSamples.push([d, departure21Msl(x)]);
    }
  }

  svg.appendChild(svgElement("path", {
    d: sectionPath(groundSamples),
    fill: "none",
    stroke: "#556b5d",
    "stroke-width": 2,
    "stroke-dasharray": "8 5"
  }));
  svg.appendChild(svgElement("path", {
    d: sectionPath(samples),
    fill: "none",
    stroke: colors.approach,
    "stroke-width": 3
  }));
  svg.appendChild(svgElement("path", {
    d: sectionPath(takeoffSamples),
    fill: "none",
    stroke: colors.takeoff,
    "stroke-width": 3
  }));
  svg.appendChild(svgElement("path", {
    d: sectionPath(departureSamples),
    fill: "none",
    stroke: colors.departure,
    "stroke-width": 3
  }));

  svg.appendChild(svgElement("rect", {
    x: -22,
    y: -siloTopMsl,
    width: 44,
    height: siloTopMsl - terrainElevationMsl,
    fill: colors.silo,
    stroke: "#ffffff",
    "stroke-width": 1.5
  }));
  svg.appendChild(svgElement("line", { x1: 0, y1: -terrainElevationMsl, x2: 0, y2: -siloTopMsl, stroke: colors.silo, "stroke-width": 5 }));
  svg.appendChild(svgElement("polygon", {
    points: `${total - 90},${-lda03ElevationMsl} ${total + 90},${-lda03ElevationMsl} ${total + 90},${-(lda03ElevationMsl - 2)} ${total - 90},${-(lda03ElevationMsl - 2)}`,
    fill: colors.runway
  }));

  drawSectionText(svg, "silo 851 m", 28, 849);
  drawSectionText(svg, "terreno local 813 m", 28, 811, "cut-axis");
  drawSectionText(svg, "OFS aproximacao RWY 03", total * 0.42, approach03OesMsl(points.silo.x + ux * total * 0.42) + 6);
  drawSectionText(svg, "OES subida RWY 21", 150, takeoff21Msl(points.silo.x + ux * 150) - 4, "cut-axis");
  drawSectionText(svg, "OES saida IFR RWY 21", 170, departure21Msl(points.silo.x + ux * 170) + 6, "cut-axis");
  drawSectionText(svg, "LDA/CAB 03 visual", total - 170, lda03ElevationMsl + 9);
  drawSectionText(svg, "distancia do silo ate a cabeceira deslocada 03", total * 0.34, minMsl + 8, "cut-axis");
}

function fillResultsTable() {
  const tbody = document.getElementById("result-table");
  tbody.innerHTML = "";
  results.forEach((row) => {
    const tr = document.createElement("tr");
    tr.dataset.status = row[5].startsWith("Sim") ? "Sim" : "Nao";
    row.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function createSurfaceMesh(surface) {
  const group = new THREE.Group();
  surfaceParts(surface).forEach((part) => {
    const vertices = [];
    part.forEach(([x, y]) => {
      vertices.push(x, surface.z(x, y) * verticalScale, y);
    });

    const indices = [];
    for (let i = 1; i < part.length - 1; i += 1) {
      indices.push(0, i, i + 1);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      color: surface.color,
      transparent: true,
      opacity: surface.opacity + 0.12,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = surface.name;

    const lineGeometry = new THREE.BufferGeometry();
    const lineVertices = [];
    part.concat([part[0]]).forEach(([x, y]) => {
      lineVertices.push(x, surface.z(x, y) * verticalScale + 1, y);
    });
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lineVertices, 3));
    const outline = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: surface.color, transparent: true, opacity: 0.95 }));

    group.add(mesh);
    group.add(outline);
  });
  group.visible = surface.show;
  return group;
}

function init3D() {
  const container = document.getElementById("scene3d");
  if (!window.THREE || !THREE.OrbitControls) {
    container.innerHTML = '<div class="fallback">Nao foi possivel carregar a biblioteca 3D externa.</div>';
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef3f1);
  scene.fog = new THREE.Fog(0xeef3f1, 9000, 23000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(48, container.clientWidth / container.clientHeight, 1, 42000);
  setCameraHome();

  controls3d = new THREE.OrbitControls(camera, renderer.domElement);
  controls3d.enableDamping = true;
  controls3d.dampingFactor = 0.07;
  controls3d.target.set(-2600, 120, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9eb2aa, 1.15));
  const sun = new THREE.DirectionalLight(0xffffff, 0.75);
  sun.position.set(-2000, 3600, 2400);
  scene.add(sun);

  const grid = new THREE.GridHelper(16000, 32, 0xa9b8b2, 0xd6dfdc);
  grid.position.y = -1;
  scene.add(grid);

  scene.add(createRunwayMesh());
  scene.add(createSiloMesh());

  surfaces.forEach((surface) => {
    const mesh = createSurfaceMesh(surface);
    sceneObjects.set(surface.id, mesh);
    scene.add(mesh);
  });

  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  resizeObserver.observe(container);

  function animate() {
    requestAnimationFrame(animate);
    controls3d.update();
    renderer.render(scene, camera);
  }
  animate();
}

function setCameraHome() {
  if (!camera) return;
  camera.position.set(-4550, 2550, 2300);
  camera.lookAt(-2600, 120, 0);
  if (controls3d) {
    controls3d.target.set(-2600, 120, 0);
    controls3d.update();
  }
}

function createRunwayMesh() {
  const group = new THREE.Group();
  const runway = new THREE.Mesh(
    new THREE.BoxGeometry(2400, 6, 45),
    new THREE.MeshStandardMaterial({ color: colors.runway, roughness: 0.62, metalness: 0.04 })
  );
  runway.rotation.z = Math.atan(((runway21ElevationMsl - runway03ElevationMsl) * verticalScale) / 2400);
  runway.position.set(0, 0, 0);
  group.add(runway);

  const stripShape = new THREE.Shape();
  stripShape.moveTo(-1260, -150);
  stripShape.lineTo(1260, -150);
  stripShape.lineTo(1260, 150);
  stripShape.lineTo(-1260, 150);
  stripShape.lineTo(-1260, -150);
  const stripGeometry = new THREE.ShapeGeometry(stripShape);
  stripGeometry.rotateX(-Math.PI / 2);
  const strip = new THREE.Mesh(
    stripGeometry,
    new THREE.MeshBasicMaterial({ color: colors.strip, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  strip.position.y = 0.5;
  group.add(strip);

  return group;
}

function createSiloMesh() {
  const group = new THREE.Group();
  const siloHeight = 38 * verticalScale;
  const baseHeight = (terrainElevationMsl - runwayCenterElevationMsl) * verticalScale;
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(35, 35, siloHeight, 40),
    new THREE.MeshStandardMaterial({ color: colors.silo, roughness: 0.48, metalness: 0.12 })
  );
  cylinder.position.set(points.silo.x, baseHeight + siloHeight / 2, points.silo.y);
  group.add(cylinder);

  const terrain = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 55, 8, 40),
    new THREE.MeshStandardMaterial({ color: "#556b5d", roughness: 0.9 })
  );
  terrain.position.set(points.silo.x, baseHeight - 4, points.silo.y);
  group.add(terrain);

  const top = new THREE.Mesh(
    new THREE.SphereGeometry(18, 20, 12),
    new THREE.MeshBasicMaterial({ color: "#ffffff" })
  );
  top.position.set(points.silo.x, (siloTopMsl - runwayCenterElevationMsl) * verticalScale, points.silo.y);
  group.add(top);

  return group;
}

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    currentView = button.dataset.view;
    document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item === button));
    renderMap();
  });
});

document.getElementById("reset-camera").addEventListener("click", setCameraHome);

window.addEventListener("DOMContentLoaded", () => {
  buildSurfaceControls();
  renderMap();
  renderSectionCut();
  fillResultsTable();
  init3D();
  if (window.lucide) window.lucide.createIcons();
});
