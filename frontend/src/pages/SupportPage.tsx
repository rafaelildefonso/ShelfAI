import { useState } from "react";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import "./../App.css";
import { toast } from "react-toastify";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "normal",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulação de envio
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Sua solicitação de suporte foi enviada com sucesso!");
    setFormData({ subject: "", message: "", priority: "normal" });
    setSubmitting(false);
  };

  return (
    <div>
      <Header />
      <SideBarMenu pageName="support" />

      <main className="app-main">
        <div className="products-container" style={{ padding: 0 }}>
          <div className="products-header">
            <div className="page-title">
              <h1>Suporte Técnico</h1>
              <p>Estamos aqui para ajudar você com qualquer problema</p>
            </div>
          </div>

          <div
            className="support-container"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "2rem",
              alignItems: "start",
              marginTop: "2rem",
            }}
          >
            <div
              className="support-form-card"
              style={{
                background: "var(--surface-color)",
                padding: "2rem",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                boxShadow: "0 4px 6px var(--shadow-color)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  marginBottom: "1.5rem",
                }}
              >
                Abrir novo chamado
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      color: "var(--text-color)",
                    }}
                  >
                    Assunto
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Resumo do problema"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-color)",
                      color: "var(--text-color)",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      color: "var(--text-color)",
                    }}
                  >
                    Prioridade
                  </label>
                  <div
                    className="radio-group"
                    style={{ display: "flex", gap: "1.5rem" }}
                  >
                    {/* Custom styled radio buttons could be complex, keeping simple for now but compatible with theme */}
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        color: "var(--text-color)",
                      }}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value="low"
                        checked={formData.priority === "low"}
                        onChange={(e) =>
                          setFormData({ ...formData, priority: e.target.value })
                        }
                        style={{ accentColor: "var(--success-color)" }}
                      />{" "}
                      Baixa
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        color: "var(--text-color)",
                      }}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value="normal"
                        checked={formData.priority === "normal"}
                        onChange={(e) =>
                          setFormData({ ...formData, priority: e.target.value })
                        }
                        style={{ accentColor: "var(--accent-color)" }}
                      />{" "}
                      Normal
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        color: "var(--text-color)",
                      }}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value="high"
                        checked={formData.priority === "high"}
                        onChange={(e) =>
                          setFormData({ ...formData, priority: e.target.value })
                        }
                        style={{ accentColor: "var(--error-color)" }}
                      />{" "}
                      Alta
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      color: "var(--text-color)",
                    }}
                  >
                    Mensagem Detalhada
                  </label>
                  <textarea
                    required
                    className="form-textarea"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Descreva o problema em detalhes..."
                    rows={6}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-color)",
                      color: "var(--text-color)",
                      resize: "vertical",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div className="form-actions" style={{ textAlign: "right" }}>
                  <button
                    type="submit"
                    className="add-product-btn"
                    disabled={submitting}
                    style={{ opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? "Enviando..." : "Enviar Solicitação"}
                    {!submitting && (
                      <i
                        className="fa-solid fa-paper-plane"
                        style={{ marginLeft: "0.5rem" }}
                      ></i>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="support-info-sidebar">
              <div
                className="info-card"
                style={{
                  background: "var(--surface-color)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "1rem",
                  boxShadow: "0 2px 4px var(--shadow-color)",
                }}
              >
                <h3
                  style={{
                    marginBottom: "1rem",
                    fontSize: "1.1rem",
                    color: "var(--text-color)",
                  }}
                >
                  <i
                    className="fa-solid fa-clock"
                    style={{
                      color: "var(--text-secondary-color)",
                      marginRight: "0.5rem",
                    }}
                  ></i>{" "}
                  Atendimento
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary-color)" }}>
                    Segunda a Sexta
                  </span>
                  <span
                    style={{ fontWeight: "600", color: "var(--text-color)" }}
                  >
                    09:00 - 18:00
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary-color)" }}>
                    Tempo de resposta
                  </span>
                  <span
                    style={{ fontWeight: "600", color: "var(--success-color)" }}
                  >
                    ~2 horas
                  </span>
                </div>
              </div>

              <div
                className="info-card"
                style={{
                  background: "var(--surface-color)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  boxShadow: "0 2px 4px var(--shadow-color)",
                }}
              >
                <h3
                  style={{
                    marginBottom: "1rem",
                    fontSize: "1.1rem",
                    color: "var(--text-color)",
                  }}
                >
                  <i
                    className="fa-solid fa-envelope"
                    style={{
                      color: "var(--text-secondary-color)",
                      marginRight: "0.5rem",
                    }}
                  ></i>{" "}
                  Contato Direto
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary-color)",
                    fontSize: "0.9rem",
                    marginBottom: "1rem",
                  }}
                >
                  Caso prefira, envie um email diretamente para nossa equipe:
                </p>
                <a
                  href="mailto:suporte@shelfai.com"
                  style={{
                    display: "block",
                    padding: "0.75rem",
                    textAlign: "center",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    color: "var(--accent-color)",
                    fontWeight: "600",
                    textDecoration: "none",
                    borderRadius: "8px",
                    transition: "background-color 0.2s",
                  }}
                >
                  suporte@shelfai.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
