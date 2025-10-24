import React from 'react';
import { PRODUCT_FIELDS } from '../services/importService';
import type { ProductField } from '../services/importService';

interface ColumnMapperProps {
  headers: string[];
  suggestedMapping: {[key: string]: string};
  mapping: {[key: string]: string};
  onMappingChange: (field: string, column: string) => void;
  validationErrors: Array<{row: number, errors: string[]}>;
}

const ColumnMapper: React.FC<ColumnMapperProps> = ({
  headers,
  suggestedMapping,
  mapping,
  onMappingChange,
  validationErrors
}) => {
  // Adicionar opção "Não mapear" para cada campo
  const fieldOptions = [
    { key: '', label: 'Não mapear', disabled: false },
    ...headers.map(header => ({ key: header, label: header, disabled: false })),
  ];

  // Filtrar campos obrigatórios
  const requiredFields = PRODUCT_FIELDS.filter(field => field.required);
  const optionalFields = PRODUCT_FIELDS.filter(field => !field.required);

  const handleMappingChange = (field: string, column: string) => {
    onMappingChange(field, column || '');
  };

  const getFieldDisplayName = (field: ProductField) => {
    return field.label || field.key.charAt(0).toUpperCase() + field.key.slice(1);
  };

  const isFieldMapped = (fieldKey: string) => {
    return Object.values(mapping).includes(fieldKey);
  };

  const getMappedColumn = (fieldKey: string) => {
    return mapping[fieldKey] || '';
  };

  const renderFieldRow = (field: ProductField) => {
    const fieldKey = field.key;
    const currentMapping = getMappedColumn(fieldKey);
    const isRequired = field.required;
    const isMapped = isFieldMapped(fieldKey);
    const suggestedColumn = suggestedMapping[fieldKey];

    return (
      <div key={fieldKey} className={`column-mapper-row ${isRequired ? 'required' : ''} ${isMapped ? 'mapped' : ''}`}>
        <div className="field-info">
          <label className="field-label">
            {getFieldDisplayName(field)}
            {isRequired && <span className="required-indicator">*</span>}
          </label>
          <span className="field-type">{field.type}</span>
        </div>

        <div className="mapping-controls">
          <select
            value={currentMapping}
            onChange={(e) => handleMappingChange(fieldKey, e.target.value)}
            className={`field-select ${!currentMapping ? 'unmapped' : ''} ${suggestedColumn === currentMapping ? 'suggested' : ''}`}
          >
            {fieldOptions.map(option => (
              <option
                key={option.key}
                value={option.key}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {suggestedColumn && suggestedColumn !== currentMapping && (
            <button
              type="button"
              className="suggestion-btn"
              onClick={() => handleMappingChange(fieldKey, suggestedColumn)}
              title={`Usar sugestão: ${suggestedColumn}`}
            >
              <i className="fa-solid fa-lightbulb"></i>
            </button>
          )}
        </div>

        <div className="field-status">
          {isMapped && (
            <span className="status-mapped">
              <i className="fa-solid fa-check-circle"></i>
            </span>
          )}
          {!currentMapping && !isRequired && (
            <span className="status-optional">
              <i className="fa-solid fa-minus-circle"></i>
            </span>
          )}
          {!currentMapping && isRequired && (
            <span className="status-required">
              <i className="fa-solid fa-exclamation-circle"></i>
            </span>
          )}
        </div>
      </div>
    );
  };

  const requiredErrors = validationErrors.filter(error =>
    error.errors.some(err =>
      err.toLowerCase().includes('obrigatório') ||
      err.toLowerCase().includes('required')
    )
  );

  const hasRequiredFieldsUnmapped = requiredFields.some(field => !getMappedColumn(field.key));

  return (
    <div className="column-mapper">
      <div className="mapper-header">
        <h3>Mapeamento de Colunas</h3>
        <p>
          Selecione quais colunas do seu arquivo correspondem aos campos do produto.
          Os campos obrigatórios estão marcados com <span className="required-indicator">*</span>.
        </p>

        {requiredErrors.length > 0 && (
          <div className="validation-warning">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Existem {requiredErrors.length} erro(s) de validação nos campos obrigatórios</span>
          </div>
        )}

        {hasRequiredFieldsUnmapped && (
          <div className="mapping-warning">
            <i className="fa-solid fa-info-circle"></i>
            <span>Campos obrigatórios não mapeados não permitirão a importação</span>
          </div>
        )}
      </div>

      <div className="mapper-content">
        {/* Campos obrigatórios */}
        <div className="field-section">
          <h4>Campos Obrigatórios</h4>
          <div className="field-list">
            {requiredFields.map(renderFieldRow)}
          </div>
        </div>

        {/* Campos opcionais */}
        <div className="field-section">
          <h4>Campos Opcionais</h4>
          <div className="field-list">
            {optionalFields.map(renderFieldRow)}
          </div>
        </div>
      </div>

      <div className="mapper-footer">
        <div className="mapping-summary">
          <div className="summary-item">
            <span className="summary-label">Colunas do arquivo:</span>
            <span className="summary-value">{headers.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Campos mapeados:</span>
            <span className="summary-value">
              {Object.values(mapping).filter(col => col).length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Campos obrigatórios:</span>
            <span className="summary-value">
              {requiredFields.filter(field => getMappedColumn(field.key)).length}/{requiredFields.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnMapper;
