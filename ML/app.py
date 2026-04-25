from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve charts folder statically
os.makedirs("charts", exist_ok=True)
app.mount("/charts", StaticFiles(directory="charts"), name="charts")


# =========================
# 📂 LOAD FILE
# =========================
def load_file(file: UploadFile):
    if file.filename.endswith(".csv"):
        return pd.read_csv(file.file)
    elif file.filename.endswith(".xlsx"):
        return pd.read_excel(file.file)
    return None


# =========================
# 🧠 PROCESS COLUMNS
# =========================
def process_columns(df):
    datetime_cols = []

    # ✅ SAFE DATETIME DETECTION
    for col in df.columns:
        if df[col].dtype == "object":
            try:
                converted = pd.to_datetime(df[col], errors="coerce")

                if converted.notna().sum() > len(df) * 0.6:
                    df[col] = converted
                    datetime_cols.append(col)

            except:
                pass

    numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
    categorical_cols = df.select_dtypes(include="object").columns.tolist()

    useful_numeric = []
    removed_cols = []

    # 🚫 REMOVE USELESS COLUMNS
    for col in numeric_cols:
        if "id" in col.lower():
            removed_cols.append(col)
        elif df[col].nunique() == len(df):
            removed_cols.append(col)
        elif df[col].nunique() <= 1:
            removed_cols.append(col)
        else:
            useful_numeric.append(col)

    return df, useful_numeric, categorical_cols, datetime_cols, removed_cols


# =========================
# 🧠 FEATURE IMPORTANCE
# =========================
def feature_importance(df, numeric_cols):
    if len(numeric_cols) < 2:
        return {}

    target = numeric_cols[-1]  # simple heuristic
    corr = df[numeric_cols].corr()[target].drop(target)

    return corr.abs().sort_values(ascending=False).to_dict()


# =========================
# 🧠 AI EXPLANATION
# =========================
def generate_explanation(df, insights):
    text = []

    text.append(f"Dataset has {df.shape[0]} rows and {df.shape[1]} columns.")
    text.append("System removed irrelevant columns and cleaned the dataset.")

    for i in insights[:8]:
        text.append(i)

    text.append("Feature importance shows which variables matter most.")

    return " ".join(text)


# =========================
# 🚀 ANALYZE
# =========================
@app.post("/analyze")
async def analyze(file: UploadFile):
    df = load_file(file)

    if df is None:
        return {"error": "Unsupported file"}

    df, numeric_cols, categorical_cols, datetime_cols, removed_cols = process_columns(df)

    insights = []
    missing = df.isnull().sum()

    summary = df[numeric_cols].describe() if numeric_cols else {}

    # 🔢 NUMERIC ANALYSIS
    for col in numeric_cols:
        mean = df[col].mean()
        median = df[col].median()
        std = df[col].std()

        insights.append(f"{col}: avg={round(mean,2)}, median={round(median,2)}")

        if std > mean * 0.5:
            insights.append(f"{col} has high variability")

        if mean > median:
            insights.append(f"{col} is right-skewed")
        elif mean < median:
            insights.append(f"{col} is left-skewed")

        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1

        outliers = df[(df[col] < Q1 - 1.5 * IQR) | (df[col] > Q3 + 1.5 * IQR)]

        if len(outliers) > 0:
            insights.append(f"{col} has {len(outliers)} outliers")

    # 🏷️ CATEGORICAL
    for col in categorical_cols:
        insights.append(f"{col} has {df[col].nunique()} unique values")

    # ❗ MISSING VALUES
    for col in df.columns:
        if missing[col] > 0:
            insights.append(f"{col} has {missing[col]} missing values")

    # 🔗 CORRELATION
    if len(numeric_cols) > 1:
        corr = df[numeric_cols].corr()
    else:
        corr = pd.DataFrame()

    # 🔥 FEATURE IMPORTANCE
    importance = feature_importance(df, numeric_cols)

    # 📊 CHART SUGGESTIONS
    chart_suggestions = []

# Numeric → histogram
    for col in numeric_cols:
     chart_suggestions.append({
        "column": col,
        "chart": "histogram",
        "reason": "Shows distribution of values"
    })

# Categorical → bar chart (only if few categories)
    for col in categorical_cols:
     if df[col].nunique() < 20:
        chart_suggestions.append({
            "column": col,
            "chart": "bar",
            "reason": "Shows category frequency"
        })

# Scatter plots (relationships)
    if len(numeric_cols) >= 2:
     chart_suggestions.append({
        "columns": numeric_cols[:2],
        "chart": "scatter",
        "reason": "Shows relationship between variables"
    })

# Time series (if datetime exists)
    if len(datetime_cols) > 0 and len(numeric_cols) > 0:
     chart_suggestions.append({
        "columns": [datetime_cols[0], numeric_cols[0]],
        "chart": "line",
        "reason": "Shows trend over time"
    })

    # 🧠 SUMMARY
    ai_summary = f"{len(numeric_cols)} numeric, {len(categorical_cols)} categorical, {len(datetime_cols)} datetime columns detected."

    explanation = generate_explanation(df, insights)

    return {
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "datetime_columns": datetime_cols,
        "removed_columns": removed_cols,
        "summary": summary.to_dict() if numeric_cols else {},
        "insights": insights,
        "feature_importance": importance,
        "chart_suggestions": chart_suggestions,
        "ai_summary": ai_summary,
        "explanation": explanation
    }


# =========================
# 🤖 ASK YOUR DATA
# =========================
@app.post("/ask")
async def ask(file: UploadFile, question: str = Form(...)):
    df = load_file(file)

    if df is None:
        return {"error": "Unsupported file"}

    df, numeric_cols, _, _, _ = process_columns(df)

    q = question.lower()

    if "average" in q or "mean" in q:
        return {"answer": {col: round(df[col].mean(), 2) for col in numeric_cols}}

    if "max" in q:
        return {"answer": {col: df[col].max() for col in numeric_cols}}

    if "min" in q:
        return {"answer": {col: df[col].min() for col in numeric_cols}}

    if "correlation" in q:
        return {"answer": df[numeric_cols].corr().to_dict()}

    if "importance" in q:
        return {"answer": feature_importance(df, numeric_cols)}

    if "summary" in q:
        return {"answer": f"{df.shape[0]} rows, {df.shape[1]} columns"}

    return {"answer": "Try asking about average, max, correlation, or importance."}


# CHARTS

@app.post("/charts")
async def charts(file: UploadFile):
    df = load_file(file)

    if df is None:
        return {"error": "Unsupported file"}

    df, numeric_cols, _, _, _ = process_columns(df)

    os.makedirs("charts", exist_ok=True)

    paths = []

    for col in numeric_cols[:3]:
        plt.figure()
        df[col].hist()
        plt.title(f"Distribution of {col}")
        path = f"charts/{col}.png"
        plt.savefig(path)
        plt.close()
        paths.append(path)

    return {"charts": paths}