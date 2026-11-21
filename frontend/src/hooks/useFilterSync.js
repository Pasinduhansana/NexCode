"use client";

import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useCallback } from "react";

const INDUSTRY_LABELS = {
  tourism: "Tourism",
  hospitality: "Hospitality",
  retail: "Retail",
  logistics: "Logistics",
  education: "Education",
};

export function useFilterSync(projects) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const industry = searchParams?.get("industry") || "";
  const category = searchParams?.get("category") || "";

  const updateParams = useCallback(
    (updater) => {
      const next = new URLSearchParams(searchParams?.toString() || "");
      updater(next);
      const query = next.toString();
      navigate(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, pathname]
  );

  const setIndustry = useCallback(
    (value) => {
      updateParams((next) => {
        if (value) {
          next.set("industry", value);
        } else {
          next.delete("industry");
        }
        next.delete("category");
      });
    },
    [updateParams]
  );

  const setCategory = useCallback(
    (value) => {
      updateParams((next) => {
        if (value) {
          next.set("category", value);
        } else {
          next.delete("category");
        }
      });
    },
    [updateParams]
  );

  const clearFilters = useCallback(() => {
    navigate(pathname, { scroll: false });
  }, [pathname]);

  const allIndustries = useMemo(() => {
    const industrySet = new Set((projects || []).map((p) => p.industry).filter(Boolean));
    return [...industrySet].sort();
  }, [projects]);

  const allCategories = useMemo(() => {
    return [...new Set((projects || []).map((p) => p.type))].sort();
  }, [projects]);

  const availableCategories = useMemo(() => {
    if (industry) {
      const cats = (projects || [])
        .filter((p) => p.industry === industry)
        .map((p) => p.type);
      return [...new Set(cats)].sort();
    }
    return allCategories;
  }, [projects, industry, allCategories]);

  const hasActiveFilters = industry !== "" || category !== "";

  const getIndustryLabel = useCallback((val) => {
    return INDUSTRY_LABELS[val] || val;
  }, []);

  return {
    industry,
    category,
    setIndustry,
    setCategory,
    clearFilters,
    allIndustries,
    allCategories,
    availableCategories,
    hasActiveFilters,
    getIndustryLabel,
  };
}
