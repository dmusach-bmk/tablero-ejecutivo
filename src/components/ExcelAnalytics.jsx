import React, { useState } from 'react';
import { FileSpreadsheet, UploadCloud, TrendingUp, Cpu, Activity, DollarSign, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ExcelAnalytics({ excelData, onUploadData }) {
  const [dataList, setDataList] = useState(excelData);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json(ws);
        
        if (rawJson && rawJson.length > 0) {
          setDataList(rawJson);
          onUploadData(rawJson);
          setUploadMessage(`✅ Archivo Excel "${file.name}" cargado exitosamente (${rawJson.length} registros procesados).`);
        }
      } catch (err) {
        setUploadMessage('❌ Error al procesar el archivo Excel. Asegúrate de que contenga columnas estructuradas.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Chart configuration
  const labels = dataList.map(item => item.fecha || item.Date);

  const velocityChartData = {
    labels,
    datasets: [
      {
        label: 'Velocidad de Equipo (Pts)',
        data: dataList.map(item => item.velEquipo || item.Velocity || 90),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        fill: true,
        tension: 0.35,
      },
      {
        label: 'PRs Revisadas Diarias',
        data: dataList.map(item => item.prsRevisadas || item.PRs || 20),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: false,
        tension: 0.35,
      }
    ]
  };

  const qualityChartData = {
    labels,
    datasets: [
      {
        label: 'Cobertura de Tests (%)',
        data: dataList.map(item => item.coberturaTestPct || item.Coverage || 85),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 6
      },
      {
        label: 'Latencia Promedio Endpoints (ms)',
        data: dataList.map(item => item.latenciaPromMs || item.Latency || 130),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } },
      tooltip: { backgroundColor: '#111a2e', titleColor: '#fff', bodyColor: '#cbd5e1' }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  return (
    <div className="excel-analytics-container">
      <div className="card-header-flex" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>📈 Excel Analytics & Métricas Operativas Diarias</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Procesamiento diario de planillas de ingeniería, velocímetro de entregas, calidad de código y costos de infraestructura.
          </p>
        </div>

        {/* Drag and Drop / File Input */}
        <label className="btn-primary" style={{ cursor: 'pointer' }}>
          <UploadCloud size={16} /> Cargar Excel (.xlsx, .csv)
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {uploadMessage && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--accent-cyan)', borderRadius: '10px', fontSize: '0.84rem', color: '#fff', marginBottom: '1.25rem' }}>
          {uploadMessage}
        </div>
      )}

      {/* Grid of Executive Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        <div className="card-glass">
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp className="text-cyan" size={18} /> Velocidad de Entrega vs Volumen de Code Reviews
          </h3>
          <Line data={velocityChartData} options={chartOptions} />
        </div>

        <div className="card-glass">
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu className="text-emerald" size={18} /> Calidad de Código (%) vs Latencia Promedio (ms)
          </h3>
          <Bar data={qualityChartData} options={chartOptions} />
        </div>

      </div>

      {/* Structured Excel Data Table */}
      <div className="card-glass">
        <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet className="text-amber" size={18} /> Registro Diario Consolidado
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAling: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem' }}>Fecha</th>
                <th style={{ padding: '0.65rem' }}>Sprint</th>
                <th style={{ padding: '0.65rem' }}>PRs Revisadas</th>
                <th style={{ padding: '0.65rem' }}>Velocidad Pts</th>
                <th style={{ padding: '0.65rem' }}>Errores Prod</th>
                <th style={{ padding: '0.65rem' }}>Latencia Endpoints</th>
                <th style={{ padding: '0.65rem' }}>Coverage %</th>
                <th style={{ padding: '0.65rem' }}>Costo Infra USD</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '0.65rem', color: '#fff', fontWeight: 600 }}>{row.fecha || row.Date}</td>
                  <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>{row.sprint || 'Sprint 43'}</td>
                  <td style={{ padding: '0.65rem', color: 'var(--accent-cyan)' }}>{row.prsRevisadas}</td>
                  <td style={{ padding: '0.65rem', color: '#fff' }}>{row.velEquipo}</td>
                  <td style={{ padding: '0.65rem' }}>
                    <span className={`tag ${row.erroresProduccion > 0 ? 'high' : 'low'}`}>
                      {row.erroresProduccion}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem', color: 'var(--accent-violet)' }}>{row.latenciaPromMs} ms</td>
                  <td style={{ padding: '0.65rem', color: 'var(--accent-emerald)' }}>{row.coberturaTestPct}%</td>
                  <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>${row.costoInfraUSD}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
