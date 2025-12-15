import { useState } from "react";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import "./../App.css";

export default function HelpPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Como cadastrar novos produtos?",
      answer:
        "Para cadastrar novos produtos, navegue até a página 'Produtos' no menu lateral e clique no botão 'Adicionar Produto'. Preencha as informações necessárias como nome, preço, categoria e imagem, e clique em 'Salvar'.",
    },
    {
      question: "Como importar produtos via Excel/CSV?",
      answer:
        "Vá para a página 'Importar' no menu lateral. Baixe o modelo padrão, preencha com seus produtos seguindo a estrutura, e faça o upload do arquivo. O sistema processará automaticamente os dados.",
    },
    {
      question: "Como exportar meus dados?",
      answer:
        "Na página 'Exportar', você pode selecionar os produtos ou categorias que deseja exportar e escolher o formato (Excel ou CSV) e o marketplace de destino.",
    },
    {
      question: "O que fazer se esquecer minha senha?",
      answer:
        "Na tela de login, clique em 'Esqueci minha senha'. Um email será enviado com instruções para redefinir sua senha de acesso.",
    },
  ];

  return (
    <div>
      <Header />
      <SideBarMenu pageName="help" />

      <main className="app-main">
        <div className="products-container" style={{ padding: 0 }}>
          <div className="products-header text-center !justify-center">
            <div className="page-title">
              <h1>Central de Ajuda</h1>
              <p>
                Encontre respostas para suas dúvidas e aprenda a usar a
                plataforma.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: "800px", margin: "2rem auto 0" }}>
            <div
              className="search-box"
              style={{ marginBottom: "2rem", width: "100%", height: "50px" }}
            >
              <i
                className="fa-solid fa-search"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              ></i>
              <input
                type="text"
                placeholder="Qual é a sua dúvida?"
                style={{
                  width: "100%",
                  height: "100%",
                  paddingLeft: "2.5rem",
                  borderRadius: "10px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--surface-color)",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div
              className="faq-section"
              style={{
                backgroundColor: "var(--surface-color)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1.5rem",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <h2
                  style={{ fontSize: "1.2rem", fontWeight: "600", margin: 0 }}
                >
                  Perguntas Frequentes
                </h2>
              </div>

              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="faq-item"
                    style={{
                      borderBottom:
                        index < faqs.length - 1
                          ? "1px solid var(--border-color)"
                          : "none",
                    }}
                  >
                    <button
                      className="faq-question"
                      onClick={() =>
                        setActiveFaq(activeFaq === index ? null : index)
                      }
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1.5rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        fontWeight: "500",
                        color: "var(--text-color)",
                        fontSize: "1rem",
                      }}
                    >
                      {faq.question}
                      <i
                        className={`fa-solid fa-chevron-down`}
                        style={{
                          transition: "transform 0.3s",
                          transform:
                            activeFaq === index
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          color: "var(--text-secondary-color)",
                        }}
                      ></i>
                    </button>
                    {activeFaq === index && (
                      <div
                        className="faq-answer"
                        style={{
                          padding: "0 1.5rem 1.5rem",
                          color: "var(--text-secondary-color)",
                          lineHeight: "1.6",
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="contact-support-card"
              style={{
                marginTop: "3rem",
                padding: "3rem",
                textAlign: "center",
                background:
                  "linear-gradient(135deg, var(--accent-color), var(--accent-color-hover))",
                borderRadius: "16px",
                color: "white",
                boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                }}
              >
                <i
                  className="fa-solid fa-headset"
                  style={{ fontSize: "2rem" }}
                ></i>
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "white",
                }}
              >
                Ainda precisa de ajuda?
              </h2>
              <p
                style={{
                  margin: "0 auto 1.5rem",
                  maxWidth: "400px",
                  opacity: 0.9,
                }}
              >
                Nossa equipe de suporte especializado está pronta para te
                atender e resolver seus problemas.
              </p>
              <button
                onClick={() => (window.location.href = "/support")}
                style={{
                  padding: "0.9rem 2.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "white",
                  color: "var(--accent-color)",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "transform 0.2s",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                Contatar Suporte
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
