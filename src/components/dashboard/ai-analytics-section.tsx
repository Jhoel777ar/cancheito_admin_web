
"use client";

import { useEffect, useState } from "react";
import { AISummaryCard } from "./ai-summary-card";
import { UserPredictionChart } from "./user-prediction-chart";
import { OfferPredictionChart } from "./offer-prediction-chart";
import { getDashboardSummary, getPredictiveAnalytics } from "@/app/(dashboard)/dashboard/users/actions";
import { addHours, format, isAfter } from "date-fns";
import { es } from "date-fns/locale";

// Types mirrored from flow files since they can't be exported with 'use server'
type DashboardSummaryInput = {
  totalUsers: number;
  newUsersLast30Days: number;
  totalOffers: number;
  newOffersLast30Days: number;
  activeOffers: number;
  closedOffers: number;
};

type DashboardSummaryOutput = {
  executiveSummary: string;
  keyObservations: string[];
  recommendations: string[];
};

type PredictiveAnalyticsInput = {
  userHistory: { date: string; count: number; }[];
  offerHistory: { date: string; count: number; }[];
};

type PredictiveAnalyticsOutput = {
  userPrediction: { date: string; prediction: number; }[];
  offerPrediction: { date: string; prediction: number; }[];
};


type AIAnalyticsSectionProps = {
  summaryInput: DashboardSummaryInput;
  predictiveInput: PredictiveAnalyticsInput;
};

const CACHE_KEY = 'aiDashboardAnalytics';
const CACHE_DURATION_HOURS = 12;

type CachedData = {
  summary: DashboardSummaryOutput;
  predictions: PredictiveAnalyticsOutput;
  timestamp: string;
};

export function AIAnalyticsSection({ summaryInput, predictiveInput }: AIAnalyticsSectionProps) {
  const [summary, setSummary] = useState<DashboardSummaryOutput | null>(null);
  const [predictions, setPredictions] = useState<PredictiveAnalyticsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);

  useEffect(() => {
    const fetchAIAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [summaryResult, predictionResult] = await Promise.all([
          getDashboardSummary(summaryInput),
          getPredictiveAnalytics(predictiveInput),
        ]);

        if (summaryResult.success && predictionResult.success) {
          const now = new Date();
          const cachedData: CachedData = {
            summary: summaryResult.data,
            predictions: predictionResult.data,
            timestamp: now.toISOString(),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
          setSummary(summaryResult.data);
          setPredictions(predictionResult.data);
          updateTimestamps(now);
        } else {
          throw new Error("Failed to fetch AI analytics from one or more services.");
        }
      } catch (e: any) {
        console.error("Error fetching AI analytics:", e);
        setError("No se pudo generar el análisis de IA. Revisa la consola para más detalles.");
      } finally {
        setIsLoading(false);
      }
    };
    
    const updateTimestamps = (date: Date) => {
        setLastUpdated(format(date, "d MMM yyyy, h:mm a", { locale: es }));
        setNextUpdate(format(addHours(date, CACHE_DURATION_HOURS), "d MMM yyyy, h:mm a", { locale: es }));
    }

    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const cachedData: CachedData = JSON.parse(cachedItem);
      const cacheTimestamp = new Date(cachedData.timestamp);
      const expirationDate = addHours(cacheTimestamp, CACHE_DURATION_HOURS);

      if (isAfter(new Date(), expirationDate)) {
        // Cache is expired, fetch new data
        fetchAIAnalytics();
      } else {
        // Cache is valid, use cached data
        setSummary(cachedData.summary);
        setPredictions(cachedData.predictions);
        updateTimestamps(cacheTimestamp);
        setIsLoading(false);
      }
    } else {
      // No cache, fetch new data
      fetchAIAnalytics();
    }
  }, [summaryInput, predictiveInput]);


  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <AISummaryCard 
        summary={summary}
        isLoading={isLoading}
        error={error}
        lastUpdated={lastUpdated}
        nextUpdate={nextUpdate}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-1">
        <UserPredictionChart predictions={predictions?.userPrediction} isLoading={isLoading} />
        <OfferPredictionChart predictions={predictions?.offerPrediction} isLoading={isLoading} />
      </div>
    </div>
  );
}
