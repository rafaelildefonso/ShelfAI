import React, { useState, useEffect } from 'react';
import { importService, type ImportTemplate } from '../services/importService';

interface TemplateManagerProps {
  onTemplateSelect: (template: ImportTemplate | null) => void;
  selectedTemplateId?: string;
  fileType?: 'csv' | 'xlsx';
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  onTemplateSelect,
  selectedTemplateId,
  fileType
}) => {
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    fileType: fileType || 'csv',
    delimiter: ',',
    mapping: {} as {[key: string]: string},
    isDefault: false
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (fileType) {
      setNewTemplate(prev => ({ ...prev, fileType }));
    }
  }, [fileType]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await importService.getTemplates();
      setTemplates(result.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const template = await importService.createTemplate({
        ...newTemplate,
        mapping: newTemplate.mapping
      });

      setTemplates(prev => [...prev, template]);
      setShowCreateForm(false);
      setNewTemplate({
        name: '',
        description: '',
        fileType: fileType || 'csv',
        delimiter: ',',
        mapping: {},
        isDefault: false
      });

      onTemplateSelect(template);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      setLoading(true);
      setError('');
      await importService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));

      if (selectedTemplateId === templateId) {
        onTemplateSelect(null);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir template');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: ImportTemplate | null) => {
    onTemplateSelect(template);
  };

  const filteredTemplates = fileType
    ? templates.filter(t => t.fileType === fileType)
    : templates;

  return (
    <div className="template-manager">
      <div className="template-header">
        <h3>Templates de Importação</h3>
        <div className="template-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <i className="fa-solid fa-plus"></i>
            Novo Template
          </button>
          <button
            className="btn btn-outline"
            onClick={loadTemplates}
            disabled={loading}
          >
            <i className={`fa-solid fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fa-solid fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Formulário de criação */}
      {showCreateForm && (
        <form className="template-form" onSubmit={handleCreateTemplate}>
          <div className="form-group">
            <label>Nome do Template *</label>
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Produtos Eletrônicos"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={newTemplate.description}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição opcional do template"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Tipo de Arquivo</label>
            <select
              value={newTemplate.fileType}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, fileType: e.target.value as 'csv' | 'xlsx' }))}
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Excel (.xlsx)</option>
            </select>
          </div>

          {newTemplate.fileType === 'csv' && (
            <div className="form-group">
              <label>Delimitador</label>
              <select
                value={newTemplate.delimiter}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, delimiter: e.target.value }))}
              >
                <option value=",">Vírgula (,)</option>
                <option value=";">Ponto e vírgula (;)</option>
                <option value="	">Tabulação</option>
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Template'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowCreateForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de templates */}
      <div className="template-list">
        {filteredTemplates.length === 0 ? (
          <div className="no-templates">
            <i className="fa-solid fa-file-import"></i>
            <p>Nenhum template encontrado</p>
            <small>Crie um template para reutilizar mapeamentos em futuras importações</small>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`template-item ${selectedTemplateId === template.id ? 'selected' : ''}`}
            >
              <div className="template-info">
                <div className="template-name">
                  {template.name}
                  {template.isDefault && (
                    <span className="default-badge">Padrão</span>
                  )}
                </div>
                {template.description && (
                  <div className="template-description">{template.description}</div>
                )}
                <div className="template-meta">
                  <span className="template-type">
                    <i className={`fa-solid ${template.fileType === 'csv' ? 'fa-file-csv' : 'fa-file-excel'}`}></i>
                    {template.fileType.toUpperCase()}
                  </span>
                  {template.delimiter && (
                    <span className="template-delimiter">
                      Delimitador: {template.delimiter}
                    </span>
                  )}
                  <span className="template-date">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="template-actions">
                <button
                  className={`btn-select ${selectedTemplateId === template.id ? 'active' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                  title="Usar este template"
                >
                  <i className="fa-solid fa-check"></i>
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteTemplate(template.id)}
                  title="Excluir template"
                  disabled={loading}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TemplateManager;
