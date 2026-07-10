import { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import { MessageSquare, Star, CheckCircle, Shield, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loading } from "@/components/ui/Loading";

const QUESTION_LABELS = {
  q1: "Facility Comfort",
  q2: "Team Support",
  q3: "Service Efficiency",
  q4: "Training Benefits",
  q5: "Communication Clarity",
  q6: "Assistive Device Condition",
  q7: "Decision Involvement",
  q8: "Complaint Response",
  q9: "Independence Improvement",
  q10: "Overall Satisfaction",
};

const Feedbacks = () => {
  const { user } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    user?.role === "PENERIMA_MANFAAT" ? "input" : "history",
  );

  // Beneficiary Form State
  const [formData, setFormData] = useState({
    program: "",
    q1: "4",
    q2: "4",
    q3: "4",
    q4: "4",
    q5: "4",
    q6: "4",
    q7: "4",
    q8: "4",
    q9: "4",
    q10: "4",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fbRes, progRes] = await Promise.all([
        api.get("/feedbacks/feedbacks/"),
        api.get("/programs/programs/"),
      ]);
      setFeedbacks(fbRes.data);
      setPrograms(progRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBeneficiarySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Combine answers into JSON for backend compatibility
    const answers = {
      q1: parseInt(formData.q1),
      q2: parseInt(formData.q2),
      q3: parseInt(formData.q3),
      q4: parseInt(formData.q4),
      q5: parseInt(formData.q5),
      q6: parseInt(formData.q6),
      q7: parseInt(formData.q7),
      q8: parseInt(formData.q8),
      q9: parseInt(formData.q9),
      q10: parseInt(formData.q10),
    };

    const combinedContent = JSON.stringify(answers);
    const averageRating = Math.round(
      Object.values(answers).reduce((a, b) => a + b, 0) / 10,
    );

    try {
      await api.post("/feedbacks/feedbacks/", {
        program: formData.program,
        content: combinedContent,
        rating: averageRating,
      });
      setSubmitted(true);
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/feedbacks/feedbacks/${id}/`, { status });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loading text="Loading Data..." />;

  const isBeneficiary = user?.role === "PENERIMA_MANFAAT";
  const isManager = user?.role === "MANAGER";
  const isOperational = user?.role === "STAFF_OPERATIONAL";

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Program",
      "Sender",
      "Date",
      "Status",
      "Feedback Content",
    ];
    const rows = feedbacks.map((fb) => [
      fb.id,
      fb.program_detail?.title || "",
      fb.user_detail?.username || "",
      new Date(fb.created_at).toLocaleDateString(),
      fb.status,
      fb.content.replace(/"/g, '""'),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) => e.map((val) => `"${val}"`).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Feedback_Report_Puspadi_Bali_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <html>
        <head>
          <title>Feedback Report Puspadi Bali</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; }
            h1 { font-size: 24px; font-weight: 800; margin-bottom: 5px; color: #0f172a; }
            p.subtitle { font-size: 14px; color: #64748b; margin-top: 0; margin-bottom: 30px; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
            .header-row { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
            .title { font-weight: bold; font-size: 16px; color: #0f172a; }
            .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
            .status { font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; background-color: #f1f5f9; color: #475569; }
            .status.resolved { background-color: #d1fae5; color: #065f46; }
            .status.reviewed { background-color: #dbeafe; color: #1e40af; }
            .status.pending { background-color: #fef3c7; color: #92400e; }
            .content { font-size: 13px; line-height: 1.6; background-color: #f8fafc; padding: 12px; border-radius: 8px; white-space: pre-line; border: 1px solid #f1f5f9; color: #334155; }
            @media print {
              body { padding: 0; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <h1>Feedback Report Puspadi Bali</h1>
          <p class="subtitle">Printed at: ${new Date().toLocaleString("en-US")}</p>
          <div>
            ${feedbacks
              .map(
                (fb) => `
              <div class="card">
                <div class="header-row">
                  <div>
                    <div class="title">${fb.program_detail?.title || "Program"}</div>
                    <div class="meta">Sender: ${fb.user_detail?.username || ""} | Date: ${new Date(fb.created_at).toLocaleDateString("en-US")}</div>
                  </div>
                  <span class="status ${fb.status.toLowerCase()}">${fb.status}</span>
                </div>
                <div class="content">${fb.content}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // ---- SUBMITTED SUCCESS VIEW ----
  if (submitted && activeTab === "input") {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto py-12 text-center">
        {isBeneficiary && (
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex gap-1 shadow-inner ring-1 ring-slate-200 dark:ring-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("input")}
                className="px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-800 text-primary shadow-sm"
              >
                Submit Feedback
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className="px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              >
                My Feedback Status
              </button>
            </div>
          </div>
        )}
        <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Thank You for Your Feedback
        </h2>
        <p className="text-slate-500 mb-8">
          Your voice matters. We will review your responses to improve our NGO
          initiatives.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          Submit Another Response
        </Button>
      </div>
    );
  }

  const canUpdate =
    user?.role === "MANAGER" || user?.role === "STAFF_OPERATIONAL";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {isBeneficiary && (
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex gap-1 shadow-inner ring-1 ring-slate-200 dark:ring-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("input")}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "input"
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Submit Feedback
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              My Feedback Status
            </button>
          </div>
        </div>
      )}

      {isBeneficiary && activeTab === "input" ? (
        <div className="max-w-3xl mx-auto pb-12 font-sans">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Your Voice Matters
            </h1>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              We value your feedback to improve our programs. Please share your
              experience with the NGO initiatives you are part of.
            </p>
          </div>

          <Card className="bg-white dark:bg-slate-950 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-8">
              <form onSubmit={handleBeneficiarySubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Select Program
                  </Label>
                  <Select
                    required
                    value={formData.program}
                    onValueChange={(v) =>
                      setFormData({ ...formData, program: v })
                    }
                  >
                    <SelectTrigger className="h-10 bg-slate-50/50 border-slate-200">
                      <SelectValue placeholder="Choose a program...">
                        {
                          programs.find(
                            (p) =>
                              p.id.toString() === formData.program.toString(),
                          )?.title
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {[
                  {
                    id: "q1",
                    text: "1. Were the facilities and service environment provided by PUSPADI Bali comfortable and accessible?",
                  },
                  {
                    id: "q2",
                    text: "2. Did the team provide adequate support during the service/training process?",
                  },
                  {
                    id: "q3",
                    text: "3. Did the service run efficiently and according to the promised timeline?",
                  },
                  {
                    id: "q4",
                    text: "4. How useful were the training and services provided for your daily life?",
                  },
                  {
                    id: "q5",
                    text: "5. Did the team communicate information clearly and comprehensively?",
                  },
                  {
                    id: "q6",
                    text: "6. Is the provided mobility aid or equipment in good condition and functioning properly?",
                  },
                  {
                    id: "q7",
                    text: "7. Were you involved in the decision-making process regarding the service or equipment provided?",
                  },
                  {
                    id: "q8",
                    text: "8. Did the team respond to your complaints and needs quickly and appropriately?",
                  },
                  {
                    id: "q9",
                    text: "9. Do you feel more independent after receiving services from PUSPADI Bali?",
                  },
                  {
                    id: "q10",
                    text: "10. Are you satisfied with the overall service provided by PUSPADI Bali?",
                  },
                ].map((q) => (
                  <div
                    key={q.id}
                    className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                      {q.text}
                    </Label>
                    <div className="flex flex-wrap gap-4 pt-1">
                      {[
                        { val: "1", label: "1 - Poor" },
                        { val: "2", label: "2 - Fair" },
                        { val: "3", label: "3 - Good" },
                        { val: "4", label: "4 - Excellent" },
                      ].map((opt) => (
                        <label
                          key={opt.val}
                          className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary transition-colors"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.val}
                            checked={formData[q.id] === opt.val}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [q.id]: e.target.value,
                              })
                            }
                            className="text-primary focus:ring-primary w-4 h-4"
                          />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 mt-4 font-semibold text-sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex gap-3">
              <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full h-fit">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-800">
                  Privacy Guaranteed
                </h4>
                <p className="text-[10px] text-emerald-600 mt-0.5 leading-relaxed">
                  Your responses are confidential and used only for program
                  improvement.
                </p>
              </div>
            </div>
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex gap-3">
              <div className="bg-slate-200 text-slate-600 p-2 rounded-full h-fit">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">
                  Real-time Impact
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  Feedback is reviewed weekly by our program coordinators.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {user?.role === "PENERIMA_MANFAAT"
                  ? "My Feedback History"
                  : "Feedback Log"}
              </h1>
              <p className="text-slate-500 text-sm">
                {user?.role === "PENERIMA_MANFAAT"
                  ? "Monitor the status and evaluations of your submitted feedback."
                  : "Review and manage beneficiary feedback reports."}
              </p>
            </div>
            {isManager && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 h-9 font-semibold text-xs border-slate-200 cursor-pointer"
                >
                  Export CSV
                </Button>
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 h-9 font-semibold text-xs border-slate-200 cursor-pointer"
                >
                  Export PDF
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {feedbacks.map((fb) => (
              <Card
                key={fb.id}
                className="overflow-hidden border-0 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm bg-white dark:bg-slate-900"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row p-5 gap-5 relative">
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        fb.status === "RESOLVED"
                          ? "bg-emerald-500"
                          : fb.status === "REVIEWED"
                            ? "bg-blue-500"
                            : "bg-amber-400"
                      }`}
                    />

                    <div className="flex-1 min-w-0 pl-2">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">
                            {fb.program_detail?.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                            <span>{fb.user_detail?.username}</span>
                            <span>•</span>
                            <span>
                              {new Date(fb.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            fb.status === "RESOLVED"
                              ? "bg-emerald-100/50 text-emerald-700"
                              : fb.status === "REVIEWED"
                                ? "bg-blue-100/50 text-blue-700"
                                : "bg-amber-100/50 text-amber-700"
                          }`}
                        >
                          {fb.status}
                        </span>
                      </div>

                      <div className="text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950 p-4 rounded-lg text-sm leading-relaxed border border-slate-100 dark:border-slate-800">
                        {(() => {
                          try {
                            const parsed = JSON.parse(fb.content);
                            return (
                              <div className="grid grid-cols-1 gap-1.5 text-xs">
                                {Object.entries(parsed).map(([key, val]) => (
                                  <div
                                    key={key}
                                    className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1"
                                  >
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                                      {key.toUpperCase()}
                                      {QUESTION_LABELS[key] && (
                                        <span className="font-normal text-slate-400 dark:text-slate-500">
                                          {" "}
                                          · {QUESTION_LABELS[key]}
                                        </span>
                                      )}
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0 ml-2">
                                      {val}/4
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          } catch (e) {
                            return (
                              <div className="whitespace-pre-line">
                                {fb.content}
                              </div>
                            );
                          }
                        })()}
                        <div className="mt-3 flex items-center gap-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            Rating:
                          </span>
                          <span className="text-amber-500 flex items-center gap-0.5">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold">{fb.rating}/4</span>
                          </span>
                        </div>
                      </div>

                      {canUpdate && fb.status !== "RESOLVED" && (
                        <div className="pt-4 flex gap-2">
                          {fb.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(fb.id, "REVIEWED")}
                              className="h-8 text-xs font-semibold"
                            >
                              Mark as Reviewed
                            </Button>
                          )}
                          <Button
                            onClick={() => updateStatus(fb.id, "RESOLVED")}
                            size="sm"
                            className="h-8 text-xs font-semibold"
                          >
                            Resolve Issue
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {feedbacks.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 border-dashed">
                <MessageSquare size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  No feedback reports found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedbacks;
