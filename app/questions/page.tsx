"use client";

import { type Select2Option } from "@/components/FormControls";
import type { ProblemRow } from "@/components/problems/types";
import QuestionsListHeader from "@/components/questions/list/QuestionsListHeader";
import QuestionsListMain from "@/components/questions/list/QuestionsListMain";
import QuestionsListSidebar from "@/components/questions/list/QuestionsListSidebar";
import { PAGE_SIZE, type QuestionsListResponse } from "@/components/questions/list/types";
import { api } from "@/lib/api";
import { fetchTagOptions } from "@/lib/questionTaxonomyApi";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";

function QuestionsPageContent() {
  const [category, setCategory] = useState<Select2Option | null>(null);
  const [difficulty, setDifficulty] = useState("");
  const [sidebarTag, setSidebarTag] = useState<Select2Option | null>(null);
  const [allTags, setAllTags] = useState<Select2Option[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ProblemRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTags, setShowTags] = useState(true);

  const searchParams = useSearchParams();

  // Handle URL Params for initial state
  useEffect(() => {
    const catParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    
    if (catParam) {
      setSearch(catParam);
    } else if (searchParam) {
      setSearch(searchParam);
    }
  }, [searchParams]);

  const searchFilterKey = useMemo(
    () =>
      [
        category?.value ?? "",
        difficulty,
        sidebarTag?.value ?? "",
        deferredSearch,
      ].join("|"),
    [category?.value, difficulty, sidebarTag?.value, deferredSearch],
  );

  const prevFilterKeyRef = useRef(searchFilterKey);
  useEffect(() => {
    if (prevFilterKeyRef.current === searchFilterKey) return;
    prevFilterKeyRef.current = searchFilterKey;
    startTransition(() => setPage(1));
  }, [searchFilterKey]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const list = await fetchTagOptions(
        { page: 1, limit: 400, status: "1" },
        { useToken: false },
      );
      if (!cancelled) setAllTags(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchQuestions = useCallback(
    async (targetPage: number) => {
      setIsLoading(true);
      setErrorMessage("");
      const useToken =
        typeof window !== "undefined" && Boolean(localStorage.getItem("token"));

      const res = await api.get<QuestionsListResponse>("/questions", {
        useToken,
        params: {
          category_id: category?.value || undefined,
          search: deferredSearch || undefined,
          difficulty: difficulty || undefined,
          tag: sidebarTag?.value || undefined,
          limit: PAGE_SIZE,
          page: targetPage,
          status: "1",
        },
      });

      if (!res.ok || !res.data?.data || !res.data.pagination) {
        setRows([]);
        setTotal(0);
        setTotalPages(1);
        setErrorMessage(res.error ?? "โหลดรายการโจทย์ไม่สำเร็จ");
        setIsLoading(false);
        return;
      }

      setRows(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.total_pages || 1);
      setIsLoading(false);
    },
    [category, difficulty, sidebarTag, deferredSearch],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async list load
    void fetchQuestions(page);
  }, [page, fetchQuestions]);

  const setDifficultyAndResetPage = (value: string) => {
    setDifficulty(value);
    setPage(1);
  };

  const setCategoryAndResetPage = (option: Select2Option | null) => {
    setCategory(option);
    setPage(1);
  };

  const toggleSidebarTag = (opt: Select2Option) => {
    setSidebarTag((prev) => (prev?.value === opt.value ? null : opt));
    setPage(1);
  };

  const clearTagFilter = () => {
    setSidebarTag(null);
    setPage(1);
  };

  return (
    <div className="relative z-10 min-h-screen w-full px-4 pb-24 pt-24 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <QuestionsListHeader
          isLoading={isLoading}
          rowsLength={rows.length}
          total={total}
          search={search}
          onSearchChange={setSearch}
        />

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <QuestionsListSidebar
            difficulty={difficulty}
            onDifficultyChange={setDifficultyAndResetPage}
            category={category}
            onCategoryChange={setCategoryAndResetPage}
            sidebarTag={sidebarTag}
            allTags={allTags}
            onToggleTag={toggleSidebarTag}
            onClearTag={clearTagFilter}
          />

          <QuestionsListMain
            errorMessage={errorMessage}
            showTags={showTags}
            onShowTagsChange={setShowTags}
            isLoading={isLoading}
            rows={rows}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div>Loading questions...</div>}>
      <QuestionsPageContent />
    </Suspense>
  );
}
