import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Users, Phone, ArrowRight, ArrowLeft, Search, Trash2 } from 'lucide-react';
import { getApiBaseUrl } from '../config.js';
import { fetchWithSession } from '../services/sessionService.js';

export default function Step3ExcelUpload({
  contactsData,
  onContactsUploaded,
  onClearContacts,
  onNext,
  onBack
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const fileInputRef = useRef(null);

  const contacts = contactsData?.contacts || [];
  const pageSize = 8;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetchWithSession(`${baseUrl}/api/upload-excel`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse Excel file.');
      }

      onContactsUploaded(data);
      setPage(1);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const baseUrl = getApiBaseUrl();
    window.open(`${baseUrl}/api/sample-excel`, '_blank');
  };

  const filteredContacts = contacts.filter((c) =>
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const totalPages = Math.ceil(filteredContacts.length / pageSize) || 1;
  const paginatedContacts = filteredContacts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="glass-panel step-panel">
      
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 32px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(6, 214, 160, 0.15)', borderRadius: '50%', marginBottom: '14px', color: '#06d6a0' }}>
          <FileSpreadsheet size={30} />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>
          Step 3: Import Patient Excel / CSV Sheet
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Upload your patient list from your clinic management system. The tool automatically detects phone numbers and patient names.
        </p>
      </div>

      {/* Top Banner / Sample Download */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f8fafc 100%)',
        border: '1.5px solid #bae6fd',
        borderRadius: '16px',
        padding: '18px 24px',
        marginBottom: '28px',
        boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.03)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            padding: '12px',
            borderRadius: '12px',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.15)'
          }}>
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{ fontSize: '15.5px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.2px' }}>
                Need the standard patient template?
              </span>
              <span style={{
                background: '#e0f2fe',
                color: '#0284c7',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #bae6fd'
              }}>
                Starter File
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              Pre-formatted with <b>Patient Name</b> & <b>Phone</b> columns. Supports .xlsx, .xls, and .csv formats.
            </div>
          </div>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={handleDownloadSample}
          style={{
            background: '#ffffff',
            border: '1.5px solid #0284c7',
            color: '#0284c7',
            fontWeight: '700',
            fontSize: '13.5px',
            padding: '10px 20px',
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.1)'
          }}
        >
          <Download size={16} />
          <span>Download Sample Excel</span>
        </button>
      </div>

      {/* Dropzone */}
      {contacts.length === 0 ? (
        <div
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7'
            }}>
              <UploadCloud size={32} />
            </div>

            <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)' }}>
              {isUploading ? 'Analyzing Excel File...' : 'Click to Upload or Drag & Drop Excel File'}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '450px' }}>
              Supports Microsoft Excel (.xlsx, .xls) and CSV sheets. Auto-sanitizes patient mobile numbers.
            </p>

            {uploadError && (
              <div style={{
                background: 'rgba(239, 71, 111, 0.15)',
                border: '1px solid rgba(239, 71, 111, 0.3)',
                color: '#ff6b8b',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Summary Stats after successful upload */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="stat-box">
              <div className="stat-number" style={{ color: '#38bdf8' }}>{contactsData.totalFound}</div>
              <div className="stat-label">Total Rows Scanned</div>
            </div>
            <div className="stat-box">
              <div className="stat-number" style={{ color: '#4ade80' }}>{contactsData.validContacts}</div>
              <div className="stat-label">Valid Patient Numbers</div>
            </div>
            <div className="stat-box">
              <div className="stat-number" style={{ color: '#facc15', fontSize: '18px', paddingTop: '6px' }}>
                {contactsData.detectedColumns?.phone || 'Auto'}
              </div>
              <div className="stat-label">Detected Phone Column</div>
            </div>
            <div className="stat-box">
              <div className="stat-number" style={{ color: '#c084fc', fontSize: '18px', paddingTop: '6px' }}>
                {contactsData.detectedColumns?.name || 'Auto'}
              </div>
              <div className="stat-label">Detected Name Column</div>
            </div>
          </div>

          {/* Table Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search patient name or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                style={{ paddingLeft: '38px', paddingBlock: '8px', fontSize: '13px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 14px', fontSize: '13px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={15} />
                <span>Upload Another File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />

              <button 
                className="btn btn-danger" 
                style={{ padding: '8px 14px', fontSize: '13px' }}
                onClick={onClearContacts}
              >
                <Trash2 size={15} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>#</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Patient Name</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>WhatsApp Number</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.map((c, idx) => (
                  <tr key={c.id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 18px', color: 'var(--text-faint)' }}>
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td style={{ padding: '12px 18px', fontWeight: '600', color: 'var(--text-main)' }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                      +{c.phone}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: 'rgba(6, 214, 160, 0.12)',
                        color: '#06d6a0'
                      }}>
                        <CheckCircle2 size={13} />
                        <span>Ready</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredContacts.length)} of {filteredContacts.length} patients
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: '12px', alignSelf: 'center', color: 'var(--text-muted)' }}>
                    {page} / {totalPages}
                  </span>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Templates</span>
        </button>

        <button 
          className="btn btn-primary" 
          disabled={contacts.length === 0} 
          onClick={onNext}
          style={{ padding: '12px 28px' }}
        >
          <span>Continue to Step 4: Anti-Ban Dispatcher</span>
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}
