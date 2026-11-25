import { SITE } from '@/lib/constants';

export interface SlipData {
  id: string;
  name: string;
  phone: string;
  courseName: string;
  stream: string;
  batchType: string;
  createdAt: string;
}

const W = 1080;
const H = 1400;
const NAVY = '#161F39';
const GOLD = '#FFC501';
const INK = '#1D1D1F';
const GREY = '#636366';
const LINE = '#E8E8EA';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws a registration slip as a PNG and downloads it. Runs in the browser only. */
export async function downloadSlip(d: SlipData): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const family = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
  const font = (weight: number, size: number) => `${weight} ${size}px ${family}`;
  const pad = 80;

  // Paper
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Header band
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, 300);
  const logo = await loadImage('/brand/logo-round.webp');
  if (logo) ctx.drawImage(logo, pad, 70, 160, 160);
  const tx = logo ? pad + 200 : pad;
  ctx.textBaseline = 'alphabetic';
  ctx.font = font(500, 64);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Mirror', tx, 150);
  const mw = ctx.measureText('Mirror ').width;
  ctx.fillStyle = GOLD;
  ctx.fillText('Academy', tx + mw, 150);
  ctx.font = font(400, 32);
  ctx.fillStyle = '#FFFFFFCC';
  ctx.fillText(`${SITE.tagline} · Berhampore`, tx, 205);

  // Title
  let y = 400;
  ctx.fillStyle = INK;
  ctx.font = font(500, 52);
  ctx.fillText('Registration slip', pad, y);
  ctx.font = font(400, 28);
  ctx.fillStyle = GREY;
  ctx.fillText('Show this slip at the Mirror Academy office.', pad, y + 50);

  // Status pill
  y += 110;
  ctx.font = font(500, 28);
  const pill = 'Application received';
  const pw = ctx.measureText(pill).width + 56;
  ctx.fillStyle = '#00A665';
  ctx.beginPath();
  ctx.roundRect(pad, y, pw, 56, 28);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(pill, pad + 28, y + 38);

  // Rows
  const date = new Date(d.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const rows: [string, string][] = [
    ['Student', d.name],
    ['Mobile', `+91 ${d.phone}`],
    ['Course', `${d.courseName} (${d.stream})`],
    ['Batch', d.batchType],
    ['Registered', date],
  ];
  y += 110;
  for (const [label, value] of rows) {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();
    ctx.font = font(400, 28);
    ctx.fillStyle = GREY;
    ctx.fillText(label, pad, y + 58);
    ctx.font = font(500, 36);
    ctx.fillStyle = INK;
    const lines = wrap(ctx, value, W - pad * 2 - 260);
    lines.forEach((l, i) => ctx.fillText(l, pad + 260, y + 60 + i * 46));
    y += 60 + lines.length * 46 + 20;
  }

  // Registration ID
  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();
  y += 70;
  ctx.font = font(400, 28);
  ctx.fillStyle = GREY;
  ctx.fillText('Registration ID', pad, y);
  ctx.font = `400 26px ui-monospace, Menlo, monospace`;
  ctx.fillStyle = INK;
  ctx.fillText(d.id, pad, y + 46);

  // Footer
  ctx.fillStyle = '#F5F5F7';
  ctx.fillRect(0, H - 200, W, 200);
  ctx.font = font(500, 30);
  ctx.fillStyle = INK;
  ctx.fillText(`Call or WhatsApp ${SITE.phoneDisplay} · ${SITE.email}`, pad, H - 125);
  ctx.font = font(400, 26);
  ctx.fillStyle = GREY;
  wrap(ctx, SITE.address, W - pad * 2).forEach((l, i) => ctx.fillText(l, pad, H - 80 + i * 34));

  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mirror-academy-slip-${d.id.slice(0, 8)}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
