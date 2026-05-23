// ============================================================
// ExamBeautify — SVG Diagram Generator
// Converts text descriptions into lightweight SVG objects.
// ============================================================

/**
 * Generate a simple placeholder SVG from a diagram description.
 * In production, Gemini would generate more precise SVGs.
 * This provides a clean fallback with the description text.
 */
export function generateSvgFromDescription(
  description: string,
  width: number = 400,
  height: number = 280
): string {
  // Analyze the description to determine diagram type
  const lowerDesc = description.toLowerCase();

  // GUARD: If the description is about non-scientific content (photos, pictures, 
  // cartoons, stories, illustrations), show a clean text placeholder — NOT a physics diagram
  const nonScienceKeywords = [
    'picture', 'photo', 'cartoon', 'illustration', 'story', 'panel',
    'classroom', 'scene', 'animal', 'rabbit', 'tortoise', 'hare',
    'children', 'student', 'teacher', 'school', 'house', 'tree',
    'flower', 'garden', 'family', 'person', 'people', 'boy', 'girl',
    'man', 'woman', 'cat', 'dog', 'bird', 'fish', 'writing',
    'observe the given', 'describe the', 'look at the', 'series of',
    'black and white', 'color', 'drawing', 'sketch', 'painting',
    'poster', 'notice', 'advertisement', 'letter', 'diary', 'essay',
    'comprehension', 'passage', 'read the', 'paragraph',
    'start', 'finish', 'race', 'running', 'sleeping', 'eating',
    'playing', 'sitting', 'standing', 'walking',
  ];

  const isNonScience = nonScienceKeywords.some(kw => lowerDesc.includes(kw));
  if (isNonScience) {
    return generatePlaceholderSvg(description, width, height);
  }

  if (lowerDesc.includes('triangle') || lowerDesc.includes('vertices')) {
    return generateTriangleSvg(description, width, height);
  }
  if (lowerDesc.includes('circuit') || lowerDesc.includes('resistor') || lowerDesc.includes('battery')) {
    return generateCircuitSvg(description, width, height);
  }
  if (lowerDesc.includes('lens') || lowerDesc.includes('mirror') || lowerDesc.includes('ray')) {
    return generateOpticsSvg(description, width, height);
  }
  if (lowerDesc.includes('dipole') || lowerDesc.includes('charge')) {
    return generateDipoleSvg(description, width, height);
  }
  if (lowerDesc.includes('solenoid') || lowerDesc.includes('coil') || lowerDesc.includes('ampere')) {
    return generateSolenoidSvg(description, width, height);
  }
  if (lowerDesc.includes('coordinate') || lowerDesc.includes('graph') || lowerDesc.includes('feasible')) {
    return generateGraphSvg(description, width, height);
  }
  if (lowerDesc.includes('microscope') || lowerDesc.includes('objective') || lowerDesc.includes('eyepiece')) {
    return generateMicroscopeSvg(description, width, height);
  }
  if (lowerDesc.includes('wavefront') || lowerDesc.includes('refraction') || lowerDesc.includes('snell')) {
    return generateRefractionSvg(description, width, height);
  }

  // Default: labeled placeholder diagram
  return generatePlaceholderSvg(description, width, height);
}

function generateTriangleSvg(_desc: string, w: number, h: number): string {
  const pad = 40;
  const ax = pad + 20, ay = h - pad;
  const bx = w / 2, by = pad + 10;
  const cx = w - pad - 20, cy = h - pad;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;border:1px solid #e2e8f0;background:#fafafa;border-radius:4px;">
  <!-- Grid -->
  ${generateGrid(w, h, pad)}
  <!-- Triangle -->
  <polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="rgba(59,130,246,0.08)" stroke="#1e293b" stroke-width="1.5"/>
  <!-- Vertices -->
  <circle cx="${ax}" cy="${ay}" r="3" fill="#1e293b"/>
  <circle cx="${bx}" cy="${by}" r="3" fill="#1e293b"/>
  <circle cx="${cx}" cy="${cy}" r="3" fill="#1e293b"/>
  <!-- Labels -->
  <text x="${ax - 15}" y="${ay + 18}" font-family="Inter,sans-serif" font-size="12" fill="#1e293b" font-weight="600">A(1,0)</text>
  <text x="${bx - 10}" y="${by - 8}" font-family="Inter,sans-serif" font-size="12" fill="#1e293b" font-weight="600">B(2,2)</text>
  <text x="${cx + 5}" y="${cy + 18}" font-family="Inter,sans-serif" font-size="12" fill="#1e293b" font-weight="600">C(3,1)</text>
  <!-- Shading label -->
  <text x="${w/2 - 25}" y="${h/2 + 30}" font-family="Inter,sans-serif" font-size="10" fill="#3b82f6" font-style="italic">Shaded Area</text>
</svg>`;
}

function generateDipoleSvg(_desc: string, w: number, h: number): string {
  const cy = h / 2;
  const leftQ = 80, rightQ = w - 160, pointP = w - 50;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;border:1px solid #e2e8f0;background:#fafafa;border-radius:4px;">
  <!-- Axis -->
  <line x1="20" y1="${cy}" x2="${w-20}" y2="${cy}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4"/>
  <!-- Charges -->
  <circle cx="${leftQ}" cy="${cy}" r="18" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
  <text x="${leftQ}" y="${cy+5}" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" fill="#ef4444" font-weight="700">−q</text>
  <circle cx="${rightQ}" cy="${cy}" r="18" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
  <text x="${rightQ}" y="${cy+5}" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" fill="#22c55e" font-weight="700">+q</text>
  <!-- Center -->
  <circle cx="${(leftQ+rightQ)/2}" cy="${cy}" r="3" fill="#1e293b"/>
  <text x="${(leftQ+rightQ)/2}" y="${cy+22}" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1e293b">O</text>
  <!-- Point P -->
  <circle cx="${pointP}" cy="${cy}" r="4" fill="#3b82f6"/>
  <text x="${pointP}" y="${cy-12}" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="#3b82f6" font-weight="600">P</text>
  <!-- Dipole moment arrow -->
  <line x1="${leftQ+25}" y1="${cy-35}" x2="${rightQ-25}" y2="${cy-35}" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowOrange)"/>
  <text x="${(leftQ+rightQ)/2}" y="${cy-42}" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#f59e0b" font-weight="600">p⃗</text>
  <!-- Distance labels -->
  <text x="${(leftQ+rightQ)/2 - 5}" y="${cy+38}" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#64748b">←  2a  →</text>
  <text x="${(rightQ+pointP)/2}" y="${cy+38}" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#64748b">← r →</text>
  <defs>
    <marker id="arrowOrange" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#f59e0b"/></marker>
  </defs>
</svg>`;
}

function generateCircuitSvg(_desc: string, w: number, h: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;border:1px solid #e2e8f0;background:#fafafa;border-radius:4px;">
  <!-- Circuit path -->
  <rect x="60" y="50" width="${w-120}" height="${h-100}" fill="none" stroke="#1e293b" stroke-width="1.5" rx="4"/>
  <!-- Battery -->
  <line x1="60" y1="${h/2-15}" x2="60" y2="${h/2+15}" stroke="#1e293b" stroke-width="3"/>
  <line x1="50" y1="${h/2-8}" x2="50" y2="${h/2+8}" stroke="#1e293b" stroke-width="1.5"/>
  <text x="30" y="${h/2+4}" font-family="Inter,sans-serif" font-size="10" fill="#1e293b">V</text>
  <!-- Resistor R1 -->
  <rect x="${w/2-40}" y="42" width="80" height="16" fill="#fef3c7" stroke="#1e293b" stroke-width="1.5" rx="2"/>
  <text x="${w/2}" y="54" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#1e293b" font-weight="600">R₁ = 4Ω</text>
  <!-- Resistor R2 -->
  <rect x="${w/2-40}" y="${h-58}" width="80" height="16" fill="#fef3c7" stroke="#1e293b" stroke-width="1.5" rx="2"/>
  <text x="${w/2}" y="${h-46}" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#1e293b" font-weight="600">R₂ = 6Ω</text>
  <!-- Labels -->
  <text x="${w/2}" y="30" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#3b82f6" font-weight="600">Parallel Circuit</text>
</svg>`;
}

function generateOpticsSvg(_desc: string, w: number, h: number): string {
  const cy = h / 2;
  const lensX = w / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;border:1px solid #e2e8f0;background:#fafafa;border-radius:4px;">
  <!-- Principal axis -->
  <line x1="20" y1="${cy}" x2="${w-20}" y2="${cy}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>
  <!-- Lens -->
  <path d="M${lensX},${cy-80} Q${lensX+15},${cy} ${lensX},${cy+80}" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <path d="M${lensX},${cy-80} Q${lensX-15},${cy} ${lensX},${cy+80}" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <!-- Arrows on lens tips -->
  <polygon points="${lensX-6},${cy-78} ${lensX},${cy-84} ${lensX+6},${cy-78}" fill="#3b82f6"/>
  <polygon points="${lensX-6},${cy+78} ${lensX},${cy+84} ${lensX+6},${cy+78}" fill="#3b82f6"/>
  <!-- Object -->
  <line x1="100" y1="${cy}" x2="100" y2="${cy-50}" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowRed)"/>
  <text x="90" y="${cy+15}" font-family="Inter,sans-serif" font-size="10" fill="#ef4444">Object</text>
  <!-- Image -->
  <line x1="${w-100}" y1="${cy}" x2="${w-100}" y2="${cy+40}" stroke="#22c55e" stroke-width="2" marker-end="url(#arrowGreen)"/>
  <text x="${w-115}" y="${cy-8}" font-family="Inter,sans-serif" font-size="10" fill="#22c55e">Image</text>
  <!-- Focal points -->
  <circle cx="${lensX-60}" cy="${cy}" r="3" fill="#f59e0b"/>
  <text x="${lensX-60}" y="${cy+15}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#f59e0b">F</text>
  <circle cx="${lensX+60}" cy="${cy}" r="3" fill="#f59e0b"/>
  <text x="${lensX+60}" y="${cy+15}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#f59e0b">F'</text>
  <!-- Ray lines -->
  <line x1="100" y1="${cy-50}" x2="${lensX}" y2="${cy-50}" stroke="#f59e0b" stroke-width="1"/>
  <line x1="${lensX}" y1="${cy-50}" x2="${w-100}" y2="${cy+40}" stroke="#f59e0b" stroke-width="1"/>
  <line x1="100" y1="${cy-50}" x2="${lensX}" y2="${cy}" stroke="#8b5cf6" stroke-width="1"/>
  <line x1="${lensX}" y1="${cy}" x2="${w-100}" y2="${cy+40}" stroke="#8b5cf6" stroke-width="1"/>
  <defs>
    <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#ef4444"/></marker>
    <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#22c55e"/></marker>
  </defs>
</svg>`;
}

function generateSolenoidSvg(_desc: string, w: number, h: number): string {
  const cy = h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;border:1px solid #e2e8f0;background:#fafafa;border-radius:4px;">
  <!-- Solenoid coils -->
  ${Array.from({ length: 12 }, (_, i) => {
    const x = 80 + i * 22;
    return `<ellipse cx="${x}" cy="${cy}" rx="8" ry="40" fill="none" stroke="#3b82f6" stroke-width="1.5"/>`;
  }).join('\n  ')}
  <!-- Axis -->
  <line x1="40" y1="${cy}" x2="${w-40}" y2="${cy}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <!-- Amperian loop -->
  <rect x="100" y="${cy-55}" width="160" height="110" fill="rgba(239,68,68,0.05)" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3" rx="3"/>
  <text x="104" y="${cy-60}" font-family="Inter,sans-serif" font-size="9" fill="#ef4444" font-weight="600">Amperian Loop ABCD</text>
  <!-- B field arrows inside -->
  ${Array.from({ length: 4 }, (_, i) => {
    const x = 120 + i * 40;
    return `<line x1="${x}" y1="${cy}" x2="${x+20}" y2="${cy}" stroke="#1e293b" stroke-width="1.5" marker-end="url(#arrowBlack)"/>`;
  }).join('\n  ')}
  <!-- Labels -->
  <text x="100" y="${cy+75}" text-anchor="start" font-family="Inter,sans-serif" font-size="10" fill="#1e293b">n turns/unit length</text>
  <text x="${w/2}" y="22" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#3b82f6" font-weight="600">Solenoid with Amperian Loop</text>
  <!-- Corner labels -->
  <text x="96" y="${cy-42}" font-family="Inter,sans-serif" font-size="10" fill="#ef4444" font-weight="600">A</text>
  <text x="262" y="${cy-42}" font-family="Inter,sans-serif" font-size="10" fill="#ef4444" font-weight="600">B</text>
  <text x="262" y="${cy+52}" font-family="Inter,sans-serif" font-size="10" fill="#ef4444" font-weight="600">C</text>
  <text x="96" y="${cy+52}" font-family="Inter,sans-serif" font-size="10" fill="#ef4444" font-weight="600">D</text>
  <defs>
    <marker id="arrowBlack" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#1e293b"/></marker>
  </defs>
</svg>`;
}

function generateGraphSvg(_desc: string, w: number, h: number): string {
  const pad = 50;
  const gw = w - 2 * pad;
  const gh = h - 2 * pad;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;border:1px solid #e2e8f0;background:#fafafa;border-radius:4px;">
  <!-- Grid -->
  ${generateGrid(w, h, pad)}
  <!-- Axes -->
  <line x1="${pad}" y1="${h-pad}" x2="${w-pad+10}" y2="${h-pad}" stroke="#1e293b" stroke-width="1.5" marker-end="url(#arrowAxis)"/>
  <line x1="${pad}" y1="${h-pad}" x2="${pad}" y2="${pad-10}" stroke="#1e293b" stroke-width="1.5" marker-end="url(#arrowAxis)"/>
  <text x="${w-pad+10}" y="${h-pad+18}" font-family="Inter,sans-serif" font-size="11" fill="#1e293b">x</text>
  <text x="${pad-18}" y="${pad-5}" font-family="Inter,sans-serif" font-size="11" fill="#1e293b">y</text>
  <!-- Constraint lines -->
  <line x1="${pad}" y1="${h-pad-gh}" x2="${pad+gw}" y2="${h-pad}" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="${pad+gw-30}" y="${h-pad-8}" font-family="Inter,sans-serif" font-size="9" fill="#3b82f6">x+y=6</text>
  <line x1="${pad}" y1="${pad+10}" x2="${pad+gw*5/8}" y2="${h-pad}" stroke="#ef4444" stroke-width="1.5"/>
  <text x="${pad+gw*5/8+5}" y="${h-pad-8}" font-family="Inter,sans-serif" font-size="9" fill="#ef4444">3x+2y=15</text>
  <!-- Feasible region -->
  <polygon points="${pad},${h-pad} ${pad+gw*5/8},${h-pad} ${pad+gw*3/8},${h-pad-gh/2} ${pad},${h-pad-gh}" fill="rgba(59,130,246,0.1)" stroke="none"/>
  <!-- Corner points -->
  <circle cx="${pad}" cy="${h-pad}" r="4" fill="#1e293b"/>
  <text x="${pad+5}" y="${h-pad+15}" font-family="Inter,sans-serif" font-size="9" fill="#1e293b">O(0,0)</text>
  <circle cx="${pad+gw*5/8}" cy="${h-pad}" r="4" fill="#1e293b"/>
  <text x="${pad+gw*5/8-5}" y="${h-pad+15}" font-family="Inter,sans-serif" font-size="9" fill="#1e293b">A(5,0)</text>
  <circle cx="${pad+gw*3/8}" cy="${h-pad-gh/2}" r="4" fill="#22c55e"/>
  <text x="${pad+gw*3/8+8}" y="${h-pad-gh/2}" font-family="Inter,sans-serif" font-size="9" fill="#22c55e" font-weight="600">B(3,3)</text>
  <circle cx="${pad}" cy="${h-pad-gh}" r="4" fill="#1e293b"/>
  <text x="${pad+5}" y="${h-pad-gh+4}" font-family="Inter,sans-serif" font-size="9" fill="#1e293b">C(0,6)</text>
  <defs>
    <marker id="arrowAxis" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#1e293b"/></marker>
  </defs>
</svg>`;
}

function generateRefractionSvg(_desc: string, w: number, h: number): string {
  const cy = h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;border:1px solid #e2e8f0;background:#fafafa;border-radius:4px;">
  <!-- Media -->
  <rect x="0" y="0" width="${w}" height="${cy}" fill="#eff6ff" stroke="none"/>
  <rect x="0" y="${cy}" width="${w}" height="${cy}" fill="#fef3c7" stroke="none"/>
  <line x1="0" y1="${cy}" x2="${w}" y2="${cy}" stroke="#1e293b" stroke-width="2"/>
  <!-- Labels -->
  <text x="15" y="25" font-family="Inter,sans-serif" font-size="11" fill="#3b82f6">Medium 1 (μ₁)</text>
  <text x="15" y="${h-15}" font-family="Inter,sans-serif" font-size="11" fill="#f59e0b">Medium 2 (μ₂)</text>
  <!-- Normal -->
  <line x1="${w/2}" y1="30" x2="${w/2}" y2="${h-30}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="${w/2+5}" y="25" font-family="Inter,sans-serif" font-size="9" fill="#94a3b8">Normal</text>
  <!-- Incident ray -->
  <line x1="${w/2-80}" y1="40" x2="${w/2}" y2="${cy}" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowIncident)"/>
  <text x="${w/2-100}" y="70" font-family="Inter,sans-serif" font-size="10" fill="#ef4444" font-weight="600">Incident Ray</text>
  <!-- Refracted ray -->
  <line x1="${w/2}" y1="${cy}" x2="${w/2+50}" y2="${h-40}" stroke="#22c55e" stroke-width="2" marker-end="url(#arrowRefracted)"/>
  <text x="${w/2+55}" y="${h-60}" font-family="Inter,sans-serif" font-size="10" fill="#22c55e" font-weight="600">Refracted</text>
  <!-- Angles -->
  <path d="M${w/2},${cy-35} A35,35 0 0,0 ${w/2-25},${cy-25}" fill="none" stroke="#ef4444" stroke-width="1.5"/>
  <text x="${w/2-30}" y="${cy-30}" font-family="Inter,sans-serif" font-size="10" fill="#ef4444" font-weight="600">i</text>
  <path d="M${w/2},${cy+30} A30,30 0 0,1 ${w/2+15},${cy+26}" fill="none" stroke="#22c55e" stroke-width="1.5"/>
  <text x="${w/2+18}" y="${cy+30}" font-family="Inter,sans-serif" font-size="10" fill="#22c55e" font-weight="600">r</text>
  <defs>
    <marker id="arrowIncident" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#ef4444"/></marker>
    <marker id="arrowRefracted" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#22c55e"/></marker>
  </defs>
</svg>`;
}

function generateMicroscopeSvg(_desc: string, w: number, h: number): string {
  const cy = h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;border:1px solid #e2e8f0;background:#fafafa;border-radius:4px;">
  <!-- Principal axis -->
  <line x1="20" y1="${cy}" x2="${w-20}" y2="${cy}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>
  <!-- Objective lens -->
  <ellipse cx="120" cy="${cy}" rx="6" ry="45" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" stroke-width="2"/>
  <text x="105" y="${cy+62}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#3b82f6" font-weight="600">Objective (f₀)</text>
  <!-- Eyepiece lens -->
  <ellipse cx="${w-120}" cy="${cy}" rx="6" ry="50" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" stroke-width="2"/>
  <text x="${w-120}" y="${cy+68}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#8b5cf6" font-weight="600">Eyepiece (fₑ)</text>
  <!-- Object -->
  <line x1="65" y1="${cy}" x2="65" y2="${cy-25}" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrowObj)"/>
  <text x="55" y="${cy+15}" font-family="Inter,sans-serif" font-size="9" fill="#ef4444" font-weight="600">AB</text>
  <!-- Intermediate image -->
  <line x1="210" y1="${cy}" x2="210" y2="${cy+35}" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowImg)"/>
  <text x="200" y="${cy-8}" font-family="Inter,sans-serif" font-size="9" fill="#f59e0b">A'B'</text>
  <!-- Final image (virtual) -->
  <line x1="35" y1="${cy}" x2="35" y2="${cy-55}" stroke="#22c55e" stroke-width="2" stroke-dasharray="3,2" marker-end="url(#arrowFinal)"/>
  <text x="12" y="${cy-58}" font-family="Inter,sans-serif" font-size="9" fill="#22c55e">A''B''</text>
  <!-- Eye -->
  <text x="${w-50}" y="${cy+5}" font-family="Inter,sans-serif" font-size="16">👁</text>
  <!-- Tube length -->
  <line x1="120" y1="${cy+80}" x2="${w-120}" y2="${cy+80}" stroke="#64748b" stroke-width="1" marker-start="url(#arrowAxisR)" marker-end="url(#arrowAxisL)"/>
  <text x="${w/2}" y="${cy+95}" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#64748b">L (tube length)</text>
  <defs>
    <marker id="arrowObj" markerWidth="6" markerHeight="5" refX="3" refY="5" orient="auto"><path d="M0,5 L3,0 L6,5" fill="#ef4444"/></marker>
    <marker id="arrowImg" markerWidth="6" markerHeight="5" refX="3" refY="0" orient="auto"><path d="M0,0 L3,5 L6,0" fill="#f59e0b"/></marker>
    <marker id="arrowFinal" markerWidth="6" markerHeight="5" refX="3" refY="5" orient="auto"><path d="M0,5 L3,0 L6,5" fill="#22c55e"/></marker>
    <marker id="arrowAxisL" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto"><path d="M0,0 L6,2.5 L0,5" fill="#64748b"/></marker>
    <marker id="arrowAxisR" markerWidth="6" markerHeight="5" refX="0" refY="2.5" orient="auto"><path d="M6,0 L0,2.5 L6,5" fill="#64748b"/></marker>
  </defs>
</svg>`;
}

function generatePlaceholderSvg(description: string, w: number, h: number): string {
  // Wrap description text to fit in the SVG
  const maxCharsPerLine = Math.floor(w / 7);
  const words = description.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += ' ' + word;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  const visibleLines = lines.slice(0, 8);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;border:1px solid #e2e8f0;background:#fafafa;border-radius:4px;">
  <rect x="15" y="15" width="${w-30}" height="${h-30}" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,3" rx="6"/>
  <text x="${w/2}" y="38" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="#3b82f6" font-weight="600">📐 Diagram</text>
  ${visibleLines.map((line, i) => `<text x="25" y="${60 + i * 16}" font-family="Inter,sans-serif" font-size="10" fill="#64748b">${escapeXml(line)}</text>`).join('\n  ')}
  ${lines.length > 8 ? `<text x="25" y="${60 + 8 * 16}" font-family="Inter,sans-serif" font-size="10" fill="#94a3b8">...</text>` : ''}
</svg>`;
}

function generateGrid(w: number, h: number, pad: number): string {
  const lines: string[] = [];
  const step = (w - 2 * pad) / 8;
  for (let i = 0; i <= 8; i++) {
    const x = pad + i * step;
    lines.push(`<line x1="${x}" y1="${pad}" x2="${x}" y2="${h-pad}" stroke="#e2e8f0" stroke-width="0.5"/>`);
  }
  const stepY = (h - 2 * pad) / 6;
  for (let i = 0; i <= 6; i++) {
    const y = pad + i * stepY;
    lines.push(`<line x1="${pad}" y1="${y}" x2="${w-pad}" y2="${y}" stroke="#e2e8f0" stroke-width="0.5"/>`);
  }
  return lines.join('\n  ');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
