import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, FileText } from "lucide-react";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { useToastStore } from "../../../stores/toastStore";
import { useLanguage } from "../../../stores/languageStore";
import {
  getScriptById,
  createScript,
  updateScript,
  translateScriptPreview,
  suggestGrammar,
} from "../api/scriptApi";
import type { ScriptHighlightCreate, LanguageType } from "../api/types";
import ScriptLivePreview from "../components/ScriptLivePreview";
import ScriptEditorToolbar from "../components/ScriptEditorToolbar";
import ScriptHighlightEditor from "../components/ScriptHighlightEditor";
import ScriptTranslationConfig from "../components/ScriptTranslationConfig";
import ScriptSidebar from "../components/ScriptSidebar";

export default function ScriptFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useLanguage();

  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [highlightPhrase, setHighlightPhrase] = useState("");

  // Highlight Tags State
  const [highlights, setHighlights] = useState<ScriptHighlightCreate[]>([]);
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [currentNote, setCurrentNote] = useState("");

  // Translation State
  const [isParagraphTranslationEnabled, setIsParagraphTranslationEnabled] =
    useState(true);
  const [defaultTranslationLanguage, setDefaultTranslationLanguage] =
    useState<LanguageType>("Vietnamese");
  const [translateHighlightPhrase, setTranslateHighlightPhrase] =
    useState(true);
  const [allowTranslationErrorReports, setAllowTranslationErrorReports] =
    useState(true);

  // Sidebar State
  const [communities, setCommunities] = useState<LanguageType[]>(["English"]);
  const [showOnHome, setShowOnHome] = useState(true);
  const [autoIpa, setAutoIpa] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [publishStatus, setPublishStatus] = useState<"Draft" | "Published">(
    "Draft"
  );

  // Live Preview Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [translatedHighlight, setTranslatedHighlight] = useState("");

  // Autosave State
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState("");
  const [lastSavedTitle, setLastSavedTitle] = useState("");

  // Grammar Suggestion State
  const [isSuggestingGrammar, setIsSuggestingGrammar] = useState(false);
  
  const handleTranslatePreview = async () => {
    if (!content.trim()) {
      addToast(
        "error",
        t.scripts?.errTitleEmpty || "Vui lòng nhập nội dung Script trước khi dịch."
      );
      return;
    }

    setIsTranslating(true);
    try {
      const res = await translateScriptPreview(
        content,
        defaultTranslationLanguage,
        translateHighlightPhrase ? highlightPhrase : undefined
      );
      setTranslatedContent(res.translatedText);
      setTranslatedHighlight(res.translatedHighlight ?? "");
      addToast("success", "Dịch thành công!");
    } catch (error) {
      addToast("error", "Lỗi khi gọi AI dịch thuật.");
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSuggestGrammar = async () => {
    if (!content.trim() || content.length < 10) {
      addToast(
        "error",
        "Vui lòng nhập nội dung đủ dài để AI phân tích."
      );
      return;
    }

    setIsSuggestingGrammar(true);
    try {
      await suggestGrammar(content);
      // setGrammarSuggestion(res);
      addToast("success", "AI đã gợi ý xong!");
    } catch (error) {
      addToast("error", "Lỗi khi gọi AI gợi ý ngữ pháp.");
      console.error(error);
    } finally {
      setIsSuggestingGrammar(false);
    }
  };

  
  useEffect(() => {
    if (isEdit) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    // Autosave logic
    const timer = setTimeout(() => {
      if (
        (title !== lastSavedTitle || content !== lastSavedContent) &&
        (title.length > 3 || content.length > 10) &&
        !isSaving
      ) {
        setLastSavedTitle(title);
        setLastSavedContent(content);
        setLastSavedTime(new Date());
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [title, content, isSaving, lastSavedTitle, lastSavedContent]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getScriptById(id!);
      setTitle(res.title);
      setTopic(res.topic ?? "");
      setContent(res.content);
      setHighlightPhrase(res.highlightPhrase ?? "");
      setHighlights(res.highlights ?? []);
      setCommunities(res.communities || ["English"]);
      setPublishStatus(res.status);
      setShowOnHome(res.showOnHome ?? true);
      setAutoIpa(res.autoIpa ?? true);
      setDisplayOrder(res.displayOrder ?? 1);
      
      setIsParagraphTranslationEnabled(res.isParagraphTranslationEnabled ?? true);
      setDefaultTranslationLanguage(res.defaultTranslationLanguage ?? "Vietnamese");
      setTranslateHighlightPhrase(res.translateHighlightPhrase ?? true);
      setAllowTranslationErrorReports(res.allowTranslationErrorReports ?? true);

      setLastSavedTitle(res.title);
      setLastSavedContent(res.content);
    } catch (error) {
      addToast("error", t.scripts?.loadError || "Failed to load script.");
      navigate("/scripts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHighlight = () => {
    if (!currentPhrase.trim()) return;
    setHighlights([
      ...highlights,
      { phrase: currentPhrase.trim(), note: currentNote.trim() },
    ]);
    setCurrentPhrase("");
    setCurrentNote("");
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleToggleCommunity = (lang: LanguageType) => {
    setCommunities([lang]);
  };

  const onSave = async (status: "Draft" | "Published") => {
    if (!title.trim()) {
      addToast(
        "error",
        t.scripts?.errTitleEmpty || "Tiêu đề không được để trống."
      );
      return;
    }
    if (!topic.trim()) {
      addToast(
        "error",
        t.scripts?.errTopicEmpty || "Chủ đề không được để trống."
      );
      return;
    }
    if (content.trim().length < 50) {
      addToast(
        "error",
        t.scripts?.errContentMin ||
          "Nội dung script cần tối thiểu 50 ký tự."
      );
      return;
    }
    if (communities.length === 0) {
      addToast(
        "error",
        t.scripts?.errCommunityEmpty || "Vui lòng chọn ít nhất 1 cộng đồng."
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        topic,
        content,
        highlightPhrase,
        highlights,
        communities,
        status: status,
        isParagraphTranslationEnabled,
        defaultTranslationLanguage,
        translateHighlightPhrase,
        allowTranslationErrorReports,
        showOnHome,
        autoIpa,
        displayOrder,
      };

      if (isEdit) {
        await updateScript(id!, payload as any);
        addToast(
          "success",
          t.scripts?.toastSaveSuccess ||
            "Script đã được cập nhật thành công."
        );
        navigate("/scripts");
      } else {
        await createScript(payload as any);
        addToast(
          "success",
          t.scripts?.toastCreateSuccess ||
            "Script đã được xuất bản thành công."
        );
        navigate("/scripts");
      }
    } catch (error) {
      addToast(
        "error",
        t.scripts?.toastSaveError || "Đã xảy ra lỗi khi lưu script."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const sentenceCount = content.trim()
    ? content.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    : 0;

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className=" mx-auto space-y-6 pb-20">
      <Breadcrumb
        items={[
          { label: "Cat Speak", href: "/" },
          { label: t.scripts?.breadcrumb || "Script", href: "/scripts" },
          {
            label: isEdit
              ? t.scripts?.editTitle || "Chỉnh sửa"
              : t.scripts?.createTitle || "Tạo Script",
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {t.scripts?.createFormTitle || "Tạo Script tương tác"}
            </h1>
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-orange-200">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
              Live Studio
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t.scripts?.createFormDesc || "Biên tập script cho học viên với hệ thống tra cứu từ vựng và dịch thuật."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onSave("Draft")}
            disabled={isSaving}
            className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 font-medium"
          >
            <Save className="w-4 h-4 mr-2" /> {t.scripts?.btnSaveDraft || "Lưu nháp"}
          </Button>
          <Button
            variant="primary"
            disabled={isSaving}
            onClick={() => onSave("Published")}
            className="bg-primary hover:bg-primary/90 focus:ring-primary border-0 shadow-md font-medium"
          >
            {t.scripts?.btnPublishNow || "Xuất bản ngay"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          {/* Main Info */}
          <Card noPadding className="border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-800 font-bold">
                <FileText className="w-5 h-5 text-red-500" />
                {t.scripts?.infoSection || "Thông tin Script"}
              </div>
              <span className="text-xs font-medium text-primary">
                {t.scripts?.requiredLabel || "* Trường bắt buộc nhập"}
              </span>
            </div>

            <div className="p-5 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  {t.scripts?.titleLabel || "Tiêu đề Script"}{" "}
                  <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.substring(0, 80))}
                    placeholder={
                      t.scripts?.titlePlaceholder || "Nhập tiêu đề..."
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 border bg-gray-50/30 font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-gray-400">
                    {title.length} / 80 {t.scripts?.charCount || "characters"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  {t.scripts?.topicLabel || "Chủ đề Script"}{" "}
                  <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value.substring(0, 50))}
                    placeholder={
                      t.scripts?.topicPlaceholder || "Nhập chủ đề (VD: Halloween, Daily Life...)"
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 border bg-gray-50/30 font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-gray-400">
                    {topic.length} / 50 {t.scripts?.charCount || "characters"}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-gray-800">
                    {t.scripts?.contentLabel || "Nội dung Script"}{" "}
                    <span className="text-primary">*</span>
                  </label>
                  <button
                    onClick={handleSuggestGrammar}
                    disabled={isSuggestingGrammar}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    {isSuggestingGrammar
                      ? t.scripts?.suggesting || "Đang phân tích..."
                      : (
                        <>
                          {t.scripts?.suggestGrammarBtn || "Gợi ý ngữ pháp Cat Speak AI"}
                        </>
                      )}
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <ScriptEditorToolbar lastSavedTime={lastSavedTime} />

                  <textarea
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      t.scripts?.contentPlaceholder ||
                      "Nhập nội dung bài đọc..."
                    }
                    className="block w-full border-0 focus:ring-0 sm:text-base p-4 resize-y"
                  ></textarea>
                </div>
                
                <div className="flex justify-between items-center mt-2 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span>
                      {t.scripts?.wordCount || "Word count:"}{" "}
                      <strong className="text-gray-700">{wordCount} {t.scripts?.wordsUnit || "words"}</strong>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>{sentenceCount} {t.scripts?.sentencesUnit || "sentences"}</span>
                    <span className="text-gray-300">|</span>
                    <span>
                      {(
                        t.scripts?.estReadingTime ||
                        "Thời lượng đọc ước tính: ~{seconds} giây"
                      ).replace(
                        "{seconds}",
                        Math.max(1, Math.ceil((wordCount / 150) * 60)).toString()
                      )}
                    </span>
                  </div>
                  <span>
                    {t.scripts?.markdownSupport ||
                      "Hỗ trợ định dạng Markdown nhẹ"}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100 border-l-2 ">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1.5">
                  <span className="text-primary w-1.5 h-1.5 bg-primary rounded-full inline-block"></span>
                  {t.scripts?.highlightPhraseLabel || "Câu nổi bật (Tùy chọn)"}
                  <span className="text-xs font-normal text-gray-500">
                    (Highlights phrase)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={highlightPhrase}
                    onChange={(e) =>
                      setHighlightPhrase(e.target.value.substring(0, 50))
                    }
                    placeholder={
                      t.scripts?.highlightPhrasePlaceholder ||
                      "Ví dụ: Trick or Treat"
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 border bg-white font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-gray-400">
                    {highlightPhrase.length} / 50 {t.scripts?.charCount || "characters"}
                  </div>
                </div>
                {/* <p className="text-[11px] text-gray-500 mt-1.5">
                  {t.scripts?.highlightPhraseDesc ||
                    "1 câu/cụm Admin chọn để hiển thị italic phía dưới body text, tạo điểm nhấn ngữ pháp/idiom."}
                </p> */}
              </div>
            </div>
          </Card>

          <ScriptHighlightEditor
            highlights={highlights}
            currentPhrase={currentPhrase}
            currentNote={currentNote}
            setCurrentPhrase={setCurrentPhrase}
            setCurrentNote={setCurrentNote}
            handleAddHighlight={handleAddHighlight}
            removeHighlight={removeHighlight}
          />

          <ScriptTranslationConfig
            isParagraphTranslationEnabled={isParagraphTranslationEnabled}
            setIsParagraphTranslationEnabled={setIsParagraphTranslationEnabled}
            defaultTranslationLanguage={defaultTranslationLanguage}
            setDefaultTranslationLanguage={setDefaultTranslationLanguage}
            translateHighlightPhrase={translateHighlightPhrase}
            setTranslateHighlightPhrase={setTranslateHighlightPhrase}
            allowTranslationErrorReports={allowTranslationErrorReports}
            setAllowTranslationErrorReports={setAllowTranslationErrorReports}
          />

          <ScriptLivePreview
            title={title || t.scripts?.noTitle || "Chưa có tiêu đề"}
            topic={topic}
            content={
              content || t.scripts?.noContent || "Nhập nội dung bài đọc ở trên để xem trước hiển thị..."
            }
            communities={communities}
            highlightPhrase={highlightPhrase}
            highlights={highlights}
            isParagraphTranslationEnabled={isParagraphTranslationEnabled}
            defaultTranslationLanguage={defaultTranslationLanguage}
            translateHighlightPhrase={translateHighlightPhrase}
            allowTranslationErrorReports={allowTranslationErrorReports}
            isTranslating={isTranslating}
            translatedContent={translatedContent}
            translatedHighlight={translatedHighlight}
            onTranslate={handleTranslatePreview}
          />
        </div>

        <div className="xl:col-span-4 space-y-5">
          <ScriptSidebar
            autoIpa={autoIpa}
            setAutoIpa={setAutoIpa}
            communities={communities}
            handleToggleCommunity={handleToggleCommunity}
            publishStatus={publishStatus}
            setPublishStatus={setPublishStatus}
            displayOrder={displayOrder}
            setDisplayOrder={setDisplayOrder}
            isSaving={isSaving}
            showOnHome={showOnHome}
            setShowOnHome={setShowOnHome}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
}
