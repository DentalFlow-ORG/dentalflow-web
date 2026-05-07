import { INVOICE_STATUS_LABEL } from '../constants/invoice-status'
import type { ServiceInvoice } from '../types/fiscal.types'
import { formatCents, formatInvoiceDate } from './invoice-format'

function escapeHtml(value: string | null | undefined): string {
  if (!value) return '—'
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function printInvoice(invoice: ServiceInvoice): void {
  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) return

  const generatedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date())

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Nota Fiscal – ${escapeHtml(invoice.customerName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 40px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header h1 { font-size: 20px; font-weight: 700; }
    .header p { font-size: 12px; color: #64748b; margin-top: 2px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .section { margin-bottom: 20px; }
    .section h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field label { font-size: 11px; color: #64748b; display: block; margin-bottom: 2px; }
    .field span { font-size: 13px; font-weight: 500; color: #0f172a; }
    .amount { font-size: 22px; font-weight: 700; color: #0f172a; }
    .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Nota Fiscal de Serviço</h1>
      <p>Documento sem validade fiscal · Modo: Local/Simulação</p>
    </div>
    <div>
      <span class="badge">${escapeHtml(INVOICE_STATUS_LABEL[invoice.status])}</span>
      ${invoice.invoiceNumber ? `<p style="font-size:11px;color:#64748b;margin-top:4px">Nº ${escapeHtml(invoice.invoiceNumber)}</p>` : ''}
    </div>
  </div>
  <div class="section">
    <h2>Tomador do serviço</h2>
    <div class="grid">
      <div class="field"><label>Nome</label><span>${escapeHtml(invoice.customerName)}</span></div>
      <div class="field"><label>CPF/CNPJ</label><span>${escapeHtml(invoice.customerDocument)}</span></div>
      <div class="field"><label>E-mail</label><span>${escapeHtml(invoice.customerEmail)}</span></div>
      <div class="field"><label>Telefone</label><span>${escapeHtml(invoice.customerPhone)}</span></div>
    </div>
  </div>
  <div class="section">
    <h2>Serviço prestado</h2>
    <p style="margin-bottom:8px;line-height:1.6">${escapeHtml(invoice.serviceDescription)}</p>
    ${invoice.serviceCode ? `<p style="font-size:12px;color:#64748b">Código de serviço: ${escapeHtml(invoice.serviceCode)}</p>` : ''}
  </div>
  <div class="section">
    <h2>Valores</h2>
    <div class="grid">
      <div class="field"><label>Valor bruto</label><span class="amount">${escapeHtml(formatCents(invoice.amountCents))}</span></div>
      <div class="field"><label>Competência</label><span>${escapeHtml(formatInvoiceDate(invoice.competenceDate))}</span></div>
      ${invoice.issRate != null ? `<div class="field"><label>Alíquota ISS</label><span>${escapeHtml(String(invoice.issRate))}%</span></div>` : ''}
      ${invoice.issAmountCents != null ? `<div class="field"><label>Valor ISS</label><span>${escapeHtml(formatCents(invoice.issAmountCents))}</span></div>` : ''}
    </div>
  </div>
  ${invoice.notes ? `<div class="section"><h2>Observações</h2><p>${escapeHtml(invoice.notes)}</p></div>` : ''}
  <div class="footer">
    Gerado em ${escapeHtml(generatedAt)} · DentalFlow
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  win.document.write(html)
  win.document.close()
}
