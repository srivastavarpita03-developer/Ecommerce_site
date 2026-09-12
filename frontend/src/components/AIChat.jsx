import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaTimes, FaRobot, FaUser, FaMagic } from "react-icons/fa";
import api from "../utils/api";
import "./AIChat.css";

function AIChat() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your personal shopping assistant. Tell me what you're looking for — style, occasion, budget — and I'll find the perfect picks for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const IMAGE_API = "http://localhost:4000/uploads/";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/ai/chat", { message: text });
      const data = response.data;

      if (data.success) {
        const assistantMessage = {
          role: "assistant",
          text: data.reply,
          products: data.products || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.message || "Sorry, I couldn't process that. Try again?",
          },
        ]);
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Oops! Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const suggestions = [
    "Show me summer dresses under ₹2000",
    "I need formal shirts for men",
    "Something trendy for a party",
    "Budget friendly casual wear",
  ];

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        className={`ai-fab ${isOpen ? "ai-fab-open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="AI Shopping Assistant"
      >
        {isOpen ? <FaTimes /> : <FaMagic />}
      </button>

      {/* CHAT WINDOW */}
      <div className={`ai-chat-window ${isOpen ? "ai-chat-open" : ""}`}>
        {/* HEADER */}
        <div className="ai-chat-header">
          <div className="ai-header-left">
            <div className="ai-avatar">
              <FaRobot />
            </div>
            <div>
              <h3>VestiQ AI</h3>
              <span className="ai-status">
                <span className="ai-status-dot" />
                Online
              </span>
            </div>
          </div>
          <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
            <FaTimes />
          </button>
        </div>

        {/* MESSAGES */}
        <div className="ai-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`ai-bubble-row ${msg.role === "user" ? "ai-bubble-user" : "ai-bubble-assistant"}`}
            >
              {msg.role === "assistant" && (
                <div className="ai-bubble-avatar">
                  <FaRobot />
                </div>
              )}

              <div className="ai-bubble-content">
                <p className="ai-bubble-text">{msg.text}</p>

                {/* PRODUCT CARDS */}
                {msg.products && msg.products.length > 0 && (
                  <div className="ai-products">
                    {msg.products.map((product) => (
                      <div
                        key={product._id}
                        className="ai-product-card"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <div className="ai-product-img">
                          <img
                            src={IMAGE_API + product?.images?.[0]}
                            alt={product.title}
                          />
                        </div>
                        <div className="ai-product-info">
                          <h4>{product.title}</h4>
                          <p className="ai-product-price">
                            ₹{Number(product.price).toLocaleString()}
                          </p>
                          {product.category?.name && (
                            <span className="ai-product-cat">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="ai-bubble-avatar ai-user-avatar">
                  <FaUser />
                </div>
              )}
            </div>
          ))}

          {/* LOADING */}
          {loading && (
            <div className="ai-bubble-row ai-bubble-assistant">
              <div className="ai-bubble-avatar">
                <FaRobot />
              </div>
              <div className="ai-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTIONS */}
        {messages.length <= 1 && (
          <div className="ai-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} className="ai-suggestion-chip" onClick={() => { setInput(s); }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* INPUT */}
        <div className="ai-input-area">
          <input
            ref={inputRef}
            type="text"
            placeholder="Describe what you're looking for..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="ai-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </>
  );
}

export default AIChat;
