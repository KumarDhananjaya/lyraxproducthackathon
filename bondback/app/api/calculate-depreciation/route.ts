import { NextResponse } from "next/server";
import { calculateStatutoryLiability, STATUTORY_BENCHMARKS } from "@/lib/depreciation";
import { ClaimCategory } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, claimAmount, itemAgeYears, hasPreExistingProof } = body;

    const benchmark = STATUTORY_BENCHMARKS[category as ClaimCategory] || {
      standardLifespanYears: 10,
    };

    const calculation = calculateStatutoryLiability({
      claimAmount: Number(claimAmount) || 0,
      ageYears: Number(itemAgeYears) || 0,
      lifespanYears: benchmark.standardLifespanYears,
      hasPreExistingProof: Boolean(hasPreExistingProof),
    });

    return NextResponse.json({
      category,
      benchmark,
      calculation,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to calculate statutory wear and tear" },
      { status: 500 }
    );
  }
}
