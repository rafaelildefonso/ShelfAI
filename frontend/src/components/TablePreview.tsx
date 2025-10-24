import React, { useState } from 'react';

interface TablePreviewProps {
  headers: string[];
  data: Array<{[key: string]: any}>;
  maxRows?: number;
  validationErrors: Array<{row: number, errors: string[]}>;
}

const TablePreview: React.FC<TablePreviewProps> = ({
  headers,
  data,
  maxRows = 5,
  validationErrors
}) => {
  const [showAllRows, setShowAllRows] = useState(false);

  const displayRows = showAllRows ? data : data.slice(0, maxRows);
  const hasMoreRows = data.length > maxRows;

  const getCellValue = (row: {[key: string]: any}, header: string) => {
    const value = row[header];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getRowErrors = (rowIndex: number) => {
    return validationErrors.find(error => error.row === rowIndex + 1)?.errors || [];
  };

  const formatHeader = (header: string) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="table-preview">
      <div className="preview-header">
        <h3>Preview dos Dados</h3>
        <div className="preview-info">
          <span className="info-item">
            <i className="fa-solid fa-table"></i>
            {headers.length} colunas
          </span>
          <span className="info-item">
            <i className="fa-solid fa-list"></i>
            {data.length} linhas
          </span>
          {validationErrors.length > 0 && (
            <span className="info-item error">
              <i className="fa-solid fa-exclamation-triangle"></i>
              {validationErrors.length} erro(s) de validação
            </span>
          )}
        </div>
      </div>

      <div className="preview-content">
        <div className="table-container">
          <table className="preview-table">
            <thead>
              <tr>
                <th className="row-number">#</th>
                {headers.map((header, index) => (
                  <th key={index} className="data-column">
                    {formatHeader(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, rowIndex) => {
                const actualRowIndex = showAllRows ? rowIndex : rowIndex;
                const errors = getRowErrors(actualRowIndex);
                const hasErrors = errors.length > 0;

                return (
                  <tr
                    key={rowIndex}
                    className={`table-row ${hasErrors ? 'has-errors' : ''}`}
                  >
                    <td className="row-number">
                      <div className="row-number-content">
                        {actualRowIndex + 1}
                        {hasErrors && (
                          <i className="fa-solid fa-exclamation-circle error-icon" title={errors.join(', ')}></i>
                        )}
                      </div>
                    </td>
                    {headers.map((header, colIndex) => {
                      const value = getCellValue(row, header);
                      const isEmpty = !value || value.trim() === '';

                      return (
                        <td key={colIndex} className={`data-cell ${isEmpty ? 'empty' : ''}`}>
                          <div className="cell-content">
                            {value || <span className="empty-indicator">-</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé com controles */}
        <div className="preview-footer">
          {hasMoreRows && (
            <button
              className="toggle-rows-btn"
              onClick={() => setShowAllRows(!showAllRows)}
            >
              <i className={`fa-solid fa-chevron-${showAllRows ? 'up' : 'down'}`}></i>
              {showAllRows ? 'Mostrar menos' : `Mostrar todas as ${data.length} linhas`}
            </button>
          )}

          {validationErrors.length > 0 && (
            <div className="validation-summary">
              <h4>Resumo de Validação</h4>
              <div className="error-list">
                {validationErrors.slice(0, 5).map((error, index) => (
                  <div key={index} className="error-item">
                    <span className="error-row">Linha {error.row}:</span>
                    <span className="error-messages">
                      {error.errors.join(', ')}
                    </span>
                  </div>
                ))}
                {validationErrors.length > 5 && (
                  <div className="error-more">
                    ... e mais {validationErrors.length - 5} erro(s)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TablePreview;
