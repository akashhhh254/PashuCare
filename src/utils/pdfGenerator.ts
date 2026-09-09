import jsPDF from 'jspdf';
import { HealthReport } from '../types';

export function generateHealthReportPDF(report: HealthReport) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header Banner
  doc.setFillColor(21, 128, 61); // Forest Green #15803d
  doc.rect(0, 0, pageWidth, 28, 'F');

  // App Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('PashuCare AI', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Smart Animal Disease Detection & Livestock Health Assistant', 14, 21);

  doc.setFontSize(9);
  doc.text(`Report ID: ${report.reportCode || report.id}`, pageWidth - 14, 14, { align: 'right' });
  doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()} ${new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, pageWidth - 14, 21, { align: 'right' });

  y = 38;

  // Animal Profile Box
  doc.setFillColor(245, 245, 244);
  doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, 'F');

  doc.setTextColor(28, 25, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ANIMAL INFORMATION', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Animal Name: ${report.animalName || 'Not specified'}`, 18, y + 14);
  doc.text(`Type: ${report.animalType}`, 75, y + 14);
  doc.text(`Overall Status: ${report.result?.overallHealthStatus || 'Evaluated'}`, 130, y + 14);

  y += 28;

  // Risk & Health Score Ribbon
  const risk = report.result?.riskLevel || 'Medium';
  if (risk === 'Emergency' || risk === 'High') {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.setTextColor(185, 28, 28);
  } else if (risk === 'Medium') {
    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(234, 179, 8);
    doc.setTextColor(161, 98, 7);
  } else {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(34, 197, 94);
    doc.setTextColor(21, 128, 61);
  }

  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`ASSESSMENT: ${risk.toUpperCase()} RISK  |  HEALTH SCORE: ${report.result?.healthScore || 70} / 100`, 18, y + 10);

  y += 22;

  // Primary Suspected Conditions
  doc.setTextColor(28, 25, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('POSSIBLE CONDITIONS (AI PRELIMINARY)', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const conditions = report.result?.possibleConditions || [];
  if (conditions.length > 0) {
    conditions.forEach((cond, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. ${cond.name} (AI Confidence: ${cond.confidence}%)`, 18, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(`Reason: ${cond.reason}`, pageWidth - 36);
      doc.text(lines, 22, y);
      y += lines.length * 4.5 + 2;
    });
  } else {
    doc.text('No acute contagious condition suspected based on reported symptoms.', 18, y);
    y += 6;
  }

  y += 3;

  // Reported and Visible Symptoms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SYMPTOMS OBSERVED & DETECTED', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const reported = report.symptoms?.length > 0 ? report.symptoms.join(', ') : 'None specified';
  const visible = report.result?.visibleSymptoms?.length > 0 ? report.result.visibleSymptoms.join(', ') : 'None marked in photo';

  const sympLines1 = doc.splitTextToSize(`Farmer Reported: ${reported}`, pageWidth - 28);
  doc.text(sympLines1, 18, y);
  y += sympLines1.length * 5;

  const sympLines2 = doc.splitTextToSize(`Photo Indications: ${visible}`, pageWidth - 28);
  doc.text(sympLines2, 18, y);
  y += sympLines2.length * 5 + 4;

  // General Care Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RECOMMENDED GENERAL CARE (SAFE ACTIONS)', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const recs = report.result?.generalRecommendations || [
    'Isolate animal in a clean, shaded, well-ventilated enclosure.',
    'Offer continuous fresh water and soft digestible fodder.',
    'Monitor body temperature and avoid stressful physical activity.'
  ];
  recs.slice(0, 4).forEach((rec) => {
    const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - 28);
    doc.text(lines, 18, y);
    y += lines.length * 4.5;
  });

  y += 4;

  // Prevention & Veterinary Advice
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('VETERINARIAN CONSULTATION ADVICE', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const vetMsg = report.result?.veterinarianRecommended
    ? 'Veterinary Consultation Urgently Recommended: A certified veterinary officer or local veterinary hospital should physically examine the animal for accurate differential diagnosis and safe treatment.'
    : 'Routine Observation: Continue monitoring feed intake and vitals. Contact a veterinary officer if symptoms do not resolve within 24-48 hours.';
  const vetLines = doc.splitTextToSize(vetMsg, pageWidth - 28);
  doc.text(vetLines, 18, y);
  y += vetLines.length * 4.5 + 4;

  // Emergency Veterinary Helpline
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, y, pageWidth - 28, 12, 2, 2, 'F');
  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('National Animal Helpline: 1962 (Toll Free) | Kisan Call Center: 1800-180-1551', 18, y + 7.5);

  y += 18;

  // Mandatory Safety Disclaimer
  doc.setFillColor(245, 245, 244);
  doc.rect(14, y, pageWidth - 28, 18, 'F');
  doc.setTextColor(120, 113, 108);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  const discText = report.result?.disclaimer || 'This AI assessment is for preliminary informational purposes only and is not a substitute for diagnosis or treatment by a qualified veterinarian. Do not administer prescription medicines without clinical supervision.';
  const discLines = doc.splitTextToSize(discText, pageWidth - 32);
  doc.text(discLines, 16, y + 5);

  // Download PDF
  doc.save(`PashuCare_Report_${report.reportCode || 'HealthCard'}.pdf`);
}
