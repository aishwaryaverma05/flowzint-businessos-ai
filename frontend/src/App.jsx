import { useState } from "react";

const invoices = [
  {
    company: "ABC Ltd",
    amount: 25000,
    status: "unpaid",
    daysOverdue: 35,
    email: "accounts@abcltd.com",
  },
  {
    company: "XYZ Corp",
    amount: 18000,
    status: "unpaid",
    daysOverdue: 22,
    email: "finance@xyzcorp.com",
  },
  {
    company: "Nova Traders",
    amount: 12000,
    status: "paid",
    daysOverdue: 0,
    email: "billing@novatraders.com",
  },
];

function App() {
  const unpaidInvoices = invoices.filter((invoice) => invoice.status === "unpaid");

  const getRisk = (invoice) => {
    if (invoice.status === "paid") return "🟢 No Risk";
    if (invoice.daysOverdue >= 30 || invoice.amount >= 25000) return "🔴 High Risk";
    if (invoice.daysOverdue >= 15) return "🟡 Medium Risk";
    return "🟢 Low Risk";
  };

  const [messages, setMessages] = useState([
    { sender: "ai", text: "Welcome to FlowZint BusinessOS AI" },
  ]);

  const [input, setInput] = useState("");
  const [totalDue, setTotalDue] = useState(
    unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  );
  const [invoiceCount, setInvoiceCount] = useState(unpaidInvoices.length);
  const [remindersSent, setRemindersSent] = useState(127);
  const [recovered] = useState(12000);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const aiInsight = `₹${totalDue.toLocaleString()} outstanding amount detected.

ABC Ltd contributes the highest unpaid amount.

Immediate follow-up recommended for high-risk accounts.`;

  const askGemini = async (commandText) => {
    setLoading(true);

    try {
      const businessContext = `
You are an AI Revenue Recovery Copilot.

Business Data:
${JSON.stringify(invoices, null, 2)}

Dashboard:
Total Due Amount: ₹${totalDue}
Unpaid Invoices: ${invoiceCount}
Reminders Sent: ${remindersSent}
Recovered Payments: ₹${recovered}

Give a short, practical, business-focused answer.
`;

      const response = await fetch("http://localhost:5000/ask-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${businessContext}\nUser question: ${commandText}`,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.answer || "AI response unavailable." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Could not connect to AI backend." },
      ]);
    }

    setLoading(false);
  };

  const processCommand = async (commandText) => {
    const command = commandText.toLowerCase();
    let aiResponse = "Command received.";
    let handledLocally = true;

    if (
      command.includes("email") ||
      command.includes("draft") ||
      command.includes("write")
    ) {
      handledLocally = false;
    }

    setMessages((prev) => [...prev, { sender: "user", text: commandText }]);

    if (handledLocally && command.includes("invoice")) {
      const invoiceList = unpaidInvoices
        .map(
          (invoice) =>
            `${invoice.company} - ₹${invoice.amount.toLocaleString()} - ${invoice.daysOverdue} days overdue - ${getRisk(invoice)}`
        )
        .join("\n");

      aiResponse = `Found ${unpaidInvoices.length} unpaid invoices:\n${invoiceList}`;
      setTotalDue(unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0));
      setInvoiceCount(unpaidInvoices.length);
    } else if (handledLocally && command.includes("reminder")) {
      const reminderMessages = unpaidInvoices
        .map(
          (invoice) =>
            `Reminder sent to ${invoice.company} at ${invoice.email} for ₹${invoice.amount.toLocaleString()}`
        )
        .join("\n");

      aiResponse = `Payment reminders sent successfully\n${reminderMessages}`;
      setRemindersSent((prev) => prev + unpaidInvoices.length);
    } else if (handledLocally && command.includes("report")) {
      aiResponse = `Business Report Generated\nTotal unpaid amount: ₹${totalDue.toLocaleString()}\nUnpaid invoices: ${invoiceCount}\nReminders sent: ${remindersSent}\nRecovered payments: ₹${recovered.toLocaleString()}`;
    } else if (handledLocally && command.includes("workflow")) {
      aiResponse =
        "Collection Workflow Created\n\nDay 1 → Send payment reminder\nDay 3 → Send polite follow-up\nDay 7 → Escalate to sales manager\nDay 10 → Send final collection notice\nDay 15 → Mark as high-risk account";
    } else if (handledLocally && command.includes("risk")) {
      const riskAnalysis = unpaidInvoices
        .map(
          (invoice) =>
            `${getRisk(invoice)}\n${invoice.company}\n₹${invoice.amount.toLocaleString()} pending\n${invoice.daysOverdue} days overdue`
        )
        .join("\n\n");

      aiResponse = `AI Risk Analysis\n\n${riskAnalysis}\n\nRecommended Action:\nPrioritize high-risk accounts first and trigger escalation workflow.`;
    } else {
      handledLocally = false;
    }

    if (handledLocally) {
      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    } else {
      await askGemini(commandText);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    processCommand(input);
    setInput("");
  };

  const runQuickAction = (command) => {
    processCommand(command);
  };

  const copyLastResponse = async () => {
    const aiMessages = messages.filter((msg) => msg.sender === "ai");
    if (!aiMessages.length) return;

    const lastAI = aiMessages[aiMessages.length - 1].text;
    await navigator.clipboard.writeText(lastAI);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardStyle = {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "14px",
    marginBottom: "15px",
  };

  const quickButtonStyle = {
    padding: "10px 14px",
    background: "#334155",
    color: "white",
    border: "1px solid #475569",
    borderRadius: "10px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        padding: "60px 30px",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "5px", textAlign: "center" }}>
        FlowZint BusinessOS AI
      </h1>

      <p style={{ color: "#94a3b8", textAlign: "center" }}>
        Run your business by chatting with AI
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "25px",
          marginTop: "30px",
          alignItems: "start",
        }}
      >
        <div>
          <div style={cardStyle}>
            <h3>Total Due Amount</h3>
            <h2>₹{totalDue.toLocaleString()}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Unpaid Invoices</h3>
            <h2>{invoiceCount}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Reminders Sent</h3>
            <h2>{remindersSent}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Recovered Payments</h3>
            <h2>₹{recovered.toLocaleString()}</h2>
          </div>

          <div style={cardStyle}>
            <h3>AI Insights</h3>
            <p style={{ whiteSpace: "pre-line", color: "#cbd5e1" }}>
              {aiInsight}
            </p>
          </div>

          <div style={cardStyle}>
            <h3>Invoice Database</h3>

            {invoices.map((invoice, index) => (
              <div
                key={index}
                style={{
                  background: "#334155",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                }}
              >
                <strong>{invoice.company}</strong>
                <p>Amount: ₹{invoice.amount.toLocaleString()}</p>
                <p>Status: {invoice.status}</p>
                <p>Overdue: {invoice.daysOverdue} days</p>
                <p>Risk: {getRisk(invoice)}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2>AI Command Center</h2>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <button style={quickButtonStyle} onClick={() => runQuickAction("show unpaid invoices")}>
              Show Invoices
            </button>

            <button style={quickButtonStyle} onClick={() => runQuickAction("send reminders")}>
              Send Reminders
            </button>

            <button style={quickButtonStyle} onClick={() => runQuickAction("generate report")}>
              Generate Report
            </button>

            <button style={quickButtonStyle} onClick={() => runQuickAction("create collection workflow")}>
              Create Workflow
            </button>

            <button style={quickButtonStyle} onClick={() => runQuickAction("analyze payment risk")}>
              Analyze Risk
            </button>

            <button style={quickButtonStyle} onClick={() => runQuickAction("Generate Email")}>
              Generate Email
            </button>
          </div>

          <div
            style={{
              maxHeight: "430px",
              overflowY: "auto",
              paddingRight: "6px",
              marginBottom: "15px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "15px",
                  padding: "12px",
                  borderRadius: "10px",
                  whiteSpace: "pre-line",
                  background: msg.sender === "user" ? "#2563eb" : "#334155",
                }}
              >
                <strong>{msg.sender === "user" ? "You" : "AI"}:</strong>
                <br />
                {msg.text}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#334155",
                }}
              >
                <strong>AI:</strong>
                <br />
                Thinking...
              </div>
            )}
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: Draft a professional payment email for ABC Ltd"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "10px",
              borderRadius: "10px",
              border: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              marginTop: "12px",
              padding: "12px 22px",
              background: loading ? "#475569" : "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Execute Command
          </button>

          <button
            onClick={copyLastResponse}
            style={{
              marginTop: "12px",
              marginLeft: "10px",
              padding: "12px 22px",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Copy Last AI Response
          </button>

          {copied && (
            <p style={{ color: "#22c55e", marginTop: "10px" }}>
              Response copied successfully
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;